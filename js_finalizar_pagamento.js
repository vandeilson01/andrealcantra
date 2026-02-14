// Configurações
        const CONFIG = {
            infinityPayHandle: 'medicoandrealcantara',
            webhookUrl: 'https://https://drandrealcantara.com.br/pagamanentos',
            redirectUrl: 'https://https://drandrealcantara.com.br/comfirmacao' 
        };

        // Elementos do DOM
        const form = document.getElementById('paymentForm');
        const pixMethod = document.getElementById('pixMethod');
        const cardMethod = document.getElementById('cardMethod');
        const cardFields = document.getElementById('cardFields');
        const orderAmount = document.getElementById('orderAmount');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const generalError = document.getElementById('generalError');
        const generalSuccess = document.getElementById('generalSuccess');

        // Event Listeners
        pixMethod.addEventListener('change', toggleCardFields);
        cardMethod.addEventListener('change', toggleCardFields);
        orderAmount.addEventListener('change', updatePaymentDetails);
        form.addEventListener('submit', handleFormSubmit);

        // Formatar número de cartão
        document.getElementById('cardNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = formattedValue;
        });

        // Formatar validade
        document.getElementById('cardExpiry').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        // Apenas números no CVV
        document.getElementById('cardCvc').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Formatar telefone
        document.getElementById('customerPhone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = '(' + value;
                } else if (value.length <= 7) {
                    value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
                } else {
                    value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7, 11);
                }
            }
            e.target.value = value;
        });

        function toggleCardFields() {
            if (cardMethod.checked) {
                cardFields.classList.add('active');
            } else {
                cardFields.classList.remove('active');
            }
        }

        function updatePaymentDetails() {
            const amount = parseFloat(orderAmount.value) || 0;
            const fee = amount * 0.029 + 0.30; // Taxa estimada (ajuste conforme necessário)
            const total = amount + fee;

            document.getElementById('subtotalDisplay').textContent = formatCurrency(amount);
            document.getElementById('feeDisplay').textContent = formatCurrency(fee);
            document.getElementById('totalDisplay').textContent = formatCurrency(total);
        }

        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        }

        function validateForm() {
            clearErrors();
            let isValid = true;

            // Validar nome
            const name = document.getElementById('customerName').value.trim();
            if (!name) {
                showError('nameError', 'Nome é obrigatório');
                isValid = false;
            }

            // Validar email
            const email = document.getElementById('customerEmail').value.trim();
            if (!email || !isValidEmail(email)) {
                showError('emailError', 'E-mail inválido');
                isValid = false;
            }

            // Validar telefone
            const phone = document.getElementById('customerPhone').value.trim();
            if (!phone || phone.replace(/\D/g, '').length < 10) {
                showError('phoneError', 'Telefone inválido');
                isValid = false;
            }

            // Validar valor
            const amount = parseFloat(orderAmount.value);
            if (!amount || amount <= 0) {
                showError('amountError', 'Valor deve ser maior que 0');
                isValid = false;
            }

            // Validar descrição
            const description = document.getElementById('orderDescription').value.trim();
            if (!description) {
                showError('descriptionError', 'Descrição é obrigatória');
                isValid = false;
            }

            // Validar campos de cartão se selecionado
            if (cardMethod.checked) {
                const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
                if (!cardNumber || cardNumber.length < 13) {
                    showError('cardNumberError', 'Número de cartão inválido');
                    isValid = false;
                }

                const expiry = document.getElementById('cardExpiry').value;
                if (!expiry || !isValidExpiry(expiry)) {
                    showError('cardExpiryError', 'Validade inválida (MM/AA)');
                    isValid = false;
                }

                const cvc = document.getElementById('cardCvc').value;
                if (!cvc || cvc.length < 3) {
                    showError('cardCvcError', 'CVV inválido');
                    isValid = false;
                }

                const holder = document.getElementById('cardHolder').value.trim();
                if (!holder) {
                    showError('cardHolderError', 'Titular é obrigatório');
                    isValid = false;
                }
            }

            return isValid;
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function isValidExpiry(expiry) {
            const parts = expiry.split('/');
            if (parts.length !== 2) return false;
            const month = parseInt(parts[0]);
            const year = parseInt(parts[1]);
            return month >= 1 && month <= 12 && year >= 24;
        }

        function showError(elementId, message) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.classList.add('show');
            }
        }

        function clearErrors() {
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
        }

        async function handleFormSubmit(e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            submitBtn.disabled = true;
            loading.style.display = 'block';
            generalError.classList.remove('show');
            generalSuccess.classList.remove('show');

            try {
                // Preparar dados para a API da InfinitePay
                const amount = parseFloat(orderAmount.value);
                const amountInCents = Math.round(amount * 100);

                const payload = {
                    handle: CONFIG.infinityPayHandle,
                    items: [
                        {
                            quantity: 1,
                            price: amountInCents,
                            description: document.getElementById('orderDescription').value
                        }
                    ],
                    order_nsu: generateOrderNSU(),
                    redirect_url: window.location.origin + '/' + CONFIG.redirectUrl + '?status=success',
                    webhook_url: CONFIG.webhookUrl,
                    customer: {
                        name: document.getElementById('customerName').value,
                        email: document.getElementById('customerEmail').value,
                        phone_number: '+55' + document.getElementById('customerPhone').value.replace(/\D/g, '')
                    }
                };

                // Fazer requisição à API da InfinitePay
                const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Erro ao gerar link de pagamento');
                }

                const data = await response.json();

                // Armazenar dados da transação no localStorage
                const transactionData = {
                    orderNSU: payload.order_nsu,
                    customerName: document.getElementById('customerName').value,
                    customerPhone: document.getElementById('customerPhone').value,
                    amount: amount,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('lastTransaction', JSON.stringify(transactionData));

                // Redirecionar para o link de pagamento
                if (data.link) {
                    window.location.href = data.link;
                } else {
                    throw new Error('Link de pagamento não retornado');
                }

            } catch (error) {
                console.error('Erro:', error);
                generalError.textContent = 'Erro ao processar pagamento. Tente novamente.';
                generalError.classList.add('show');
                submitBtn.disabled = false;
                loading.style.display = 'none';
            }
        }

        function generateOrderNSU() {
            return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        // Inicializar
        updatePaymentDetails();