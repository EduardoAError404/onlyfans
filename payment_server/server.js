require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar ao banco de dados do sistema principal
const dbPath = path.join(__dirname, '..', 'src', 'database', 'app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados');
    }
});

// Criar tabela de assinaturas se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        profile_username TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_name TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_session_id TEXT,
        plan_type TEXT NOT NULL,
        plan_months INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (profile_id) REFERENCES profile (id)
    )
`, (err) => {
    if (err) {
        console.error('❌ Erro ao criar tabela de assinaturas:', err.message);
    } else {
        console.log('✅ Tabela de assinaturas verificada/criada');
    }
});

// ==================== ROTAS ====================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Payment server is running' });
});

// Obter informações do perfil
app.get('/api/profile/:username', (req, res) => {
    const { username } = req.params;
    
    db.get(
        'SELECT id, username, display_name, subscription_price FROM profile WHERE username = ?',
        [username],
        (err, row) => {
            if (err) {
                console.error('Erro ao buscar perfil:', err);
                return res.status(500).json({ error: 'Erro ao buscar perfil' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Perfil não encontrado' });
            }
            
            res.json(row);
        }
    );
});

// Calcular preços dos planos
function calculatePlanPrices(monthlyPrice, months) {
    const basePrice = monthlyPrice * months;
    let discount = 0;
    
    // Aplicar descontos
    if (months === 6) {
        discount = 0.20; // 20% de desconto para 6 meses
    } else if (months === 12) {
        discount = 0.35; // 35% de desconto para 12 meses
    }
    
    const finalPrice = basePrice * (1 - discount);
    
    return {
        basePrice: Math.round(basePrice * 100) / 100,
        discount: Math.round(discount * 100),
        finalPrice: Math.round(finalPrice * 100) / 100,
        priceInCents: Math.round(finalPrice * 100)
    };
}

// Obter planos de assinatura para um perfil
app.get('/api/subscription-plans/:username', (req, res) => {
    const { username } = req.params;
    
    db.get(
        'SELECT id, username, display_name, subscription_price FROM profile WHERE username = ?',
        [username],
        (err, row) => {
            if (err) {
                console.error('Erro ao buscar perfil:', err);
                return res.status(500).json({ error: 'Erro ao buscar perfil' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Perfil não encontrado' });
            }
            
            const monthlyPrice = row.subscription_price || 9.99;
            
            const plans = [
                {
                    id: '1-month',
                    name: '1 Mês',
                    months: 1,
                    ...calculatePlanPrices(monthlyPrice, 1),
                    popular: false
                },
                {
                    id: '6-months',
                    name: '6 Meses',
                    months: 6,
                    ...calculatePlanPrices(monthlyPrice, 6),
                    popular: false
                },
                {
                    id: '12-months',
                    name: '12 Meses',
                    months: 12,
                    ...calculatePlanPrices(monthlyPrice, 12),
                    popular: true
                }
            ];
            
            res.json({
                profile: {
                    id: row.id,
                    username: row.username,
                    display_name: row.display_name,
                    monthly_price: monthlyPrice
                },
                plans
            });
        }
    );
});

// Criar sessão de checkout do Stripe
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { username, planId, customerEmail, customerName } = req.body;
        
        if (!username || !planId) {
            return res.status(400).json({ error: 'Username e planId são obrigatórios' });
        }
        
        // Buscar informações do perfil
        db.get(
            'SELECT id, username, display_name, subscription_price FROM profile WHERE username = ?',
            [username],
            async (err, profile) => {
                if (err) {
                    console.error('Erro ao buscar perfil:', err);
                    return res.status(500).json({ error: 'Erro ao buscar perfil' });
                }
                
                if (!profile) {
                    return res.status(404).json({ error: 'Perfil não encontrado' });
                }
                
                // Determinar número de meses
                let months = 1;
                if (planId === '6-months') months = 6;
                else if (planId === '12-months') months = 12;
                
                const monthlyPrice = profile.subscription_price || 9.99;
                const pricing = calculatePlanPrices(monthlyPrice, months);
                
                try {
                    // Criar sessão de checkout do Stripe
                    const session = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        mode: 'payment',
                        customer_email: customerEmail,
                        line_items: [
                            {
                                price_data: {
                                    currency: 'usd',
                                    product_data: {
                                        name: `Assinatura ${months} ${months === 1 ? 'Mês' : 'Meses'} - ${profile.display_name}`,
                                        description: `Acesso exclusivo ao perfil @${profile.username}`,
                                        images: []
                                    },
                                    unit_amount: pricing.priceInCents
                                },
                                quantity: 1
                            }
                        ],
                        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/${username}`,
                        metadata: {
                            profile_id: profile.id.toString(),
                            profile_username: profile.username,
                            plan_months: months.toString(),
                            customer_name: customerName || ''
                        }
                    });
                    
                    // Salvar informação da sessão no banco
                    db.run(
                        `INSERT INTO subscriptions 
                        (profile_id, profile_username, customer_email, customer_name, stripe_session_id, plan_type, plan_months, amount, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            profile.id,
                            profile.username,
                            customerEmail,
                            customerName || null,
                            session.id,
                            planId,
                            months,
                            pricing.finalPrice,
                            'pending'
                        ],
                        (err) => {
                            if (err) {
                                console.error('Erro ao salvar assinatura:', err);
                            }
                        }
                    );
                    
                    res.json({ 
                        sessionId: session.id,
                        url: session.url
                    });
                    
                } catch (stripeError) {
                    console.error('Erro do Stripe:', stripeError);
                    res.status(500).json({ 
                        error: 'Erro ao criar sessão de pagamento',
                        details: stripeError.message 
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});

// Webhook do Stripe para processar eventos
app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Processar eventos
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            // Atualizar status da assinatura
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + parseInt(session.metadata.plan_months));
            
            db.run(
                `UPDATE subscriptions 
                SET status = 'active', 
                    stripe_customer_id = ?,
                    expires_at = ?
                WHERE stripe_session_id = ?`,
                [session.customer, expiresAt.toISOString(), session.id],
                (err) => {
                    if (err) {
                        console.error('Erro ao atualizar assinatura:', err);
                    } else {
                        console.log('✅ Assinatura ativada:', session.id);
                    }
                }
            );
            break;
            
        case 'checkout.session.expired':
            const expiredSession = event.data.object;
            
            db.run(
                `UPDATE subscriptions 
                SET status = 'expired'
                WHERE stripe_session_id = ?`,
                [expiredSession.id],
                (err) => {
                    if (err) {
                        console.error('Erro ao atualizar assinatura expirada:', err);
                    }
                }
            );
            break;
            
        default:
            console.log(`Evento não tratado: ${event.type}`);
    }
    
    res.json({ received: true });
});

// Buscar dados da sessão para página de sucesso
app.get('/api/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });
        
        // Verificar se a sessão foi paga
        if (session.payment_status !== 'paid') {
            return res.status(404).json({ error: 'Session not paid' });
        }
        
        res.json({
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            customerEmail: session.customer_email,
            customerName: session.customer_details?.name || 'N/A',
            paymentMethod: 'Cartão de Crédito',
            transactionId: session.id,
            createdAt: new Date(session.created * 1000).toISOString()
        });
        
    } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        res.status(404).json({ error: 'Session not found' });
    }
});

// Verificar status de pagamento
app.get('/api/verify-payment/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        res.json({
            status: session.payment_status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total / 100
        });
        
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        res.status(500).json({ error: 'Erro ao verificar pagamento' });
    }
});

// Listar assinaturas de um perfil (admin)
app.get('/api/subscriptions/:username', (req, res) => {
    const { username } = req.params;
    
    db.all(
        `SELECT * FROM subscriptions 
        WHERE profile_username = ? 
        ORDER BY created_at DESC`,
        [username],
        (err, rows) => {
            if (err) {
                console.error('Erro ao buscar assinaturas:', err);
                return res.status(500).json({ error: 'Erro ao buscar assinaturas' });
            }
            
            res.json(rows);
        }
    );
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Payment Server rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Stripe configurado: ${process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}`);
    console.log(`🗄️  Database: ${dbPath}\n`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Fechar conexão com banco ao encerrar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar banco de dados:', err);
        } else {
            console.log('\n✅ Banco de dados fechado');
        }
        process.exit(0);
    });
});

