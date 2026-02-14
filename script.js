// Configuração do Quiz
const quizData = [
    {
        id: 'nome',
        question: 'Qual é o seu nome completo?',
        type: 'text',
        placeholder: 'Digite seu nome...',
        required: true
    },
    {
        id: 'sexo',
        question: 'Qual é o seu sexo?',
        type: 'radio',
        options: ['Masculino', 'Feminino'],
        required: true
    },
    {
        id: 'dataNascimento',
        question: 'Qual é a sua data de nascimento?',
        type: 'date',
        placeholder: 'DD/MM/YYYY',
        required: true
    },
    {
        id: 'cpf',
        question: 'Qual é o seu CPF?',
        type: 'text',
        placeholder: 'Digite seu CPF (apenas números)...',
        required: true
    },
    {
        id: 'cep',
        question: 'Qual é o seu CEP?',
        type: 'text',
        placeholder: 'Digite seu CEP (apenas números)...',
        required: true
    },
    {
        id: 'numeroCasa',
        question: 'Qual é o número da sua casa/apartamento?',
        type: 'text',
        placeholder: 'Digite o número...',
        required: true
    },
    {
        id: 'motivoConsulta',
        question: 'Qual é o motivo da consulta?',
        type: 'text',
        placeholder: 'Descreva o motivo...',
        required: true
    },
    {
        id: 'doencaDiagnosticada',
        question: 'Tem alguma doença diagnosticada?',
        type: 'text',
        placeholder: 'Digite sua resposta...',
        required: true
    },
    {
        id: 'medicamento',
        question: 'Usa algum medicamento diariamente? Se sim, qual?',
        type: 'text',
        placeholder: 'Digite sua resposta...',
        required: true
    },
    {
        id: 'alergia',
        question: 'Tem alergia a algum medicamento?',
        type: 'text',
        placeholder: 'Digite sua resposta...',
        required: true
    }
];

// Estado do Quiz
let currentQuestion = 0;
let answers = {};
let isSubmitting = false;

// Elementos do DOM
const questionTitle = document.getElementById('questionTitle');
const answerContainer = document.getElementById('answerContainer');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const quizContent = document.querySelector('.quiz-content');

// Inicializar o Quiz
function init() {
    loadQuestion();
    setupEventListeners();
}

// Configurar Event Listeners
function setupEventListeners() {
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isSubmitting) {
            handleNext();
        }
    });
}

// Carregar Pergunta
function loadQuestion() {
    const question = quizData[currentQuestion];
    
    // Atualizar título
    questionTitle.textContent = question.question;
    
    // Limpar container
    answerContainer.innerHTML = '';
    
    // Renderizar resposta baseado no tipo
    if (question.type === 'text') {
        renderTextInput(question);
    } else if (question.type === 'date') {
        renderDateInput(question);
    } else if (question.type === 'radio') {
        renderRadioOptions(question);
    }
    
    // Atualizar botões
    updateButtons();
    
    // Atualizar progresso
    updateProgress();
    
    // Animar entrada
    quizContent.style.animation = 'none';
    setTimeout(() => {
        quizContent.style.animation = 'fadeIn 0.3s ease-out';
    }, 10);
}

// Renderizar Input de Texto
function renderTextInput(question) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = question.placeholder;
    input.value = answers[question.id] || '';
    input.addEventListener('input', (e) => {
        answers[question.id] = e.target.value;
    });
    answerContainer.appendChild(input);
    input.focus();
}

// Renderizar Input de Data
function renderDateInput(question) {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = answers[question.id] || '';
    input.addEventListener('change', (e) => {
        answers[question.id] = e.target.value;
    });
    answerContainer.appendChild(input);
    input.focus();
}

// Renderizar Opções de Rádio
function renderRadioOptions(question) {
    const group = document.createElement('div');
    group.className = 'radio-group';
    
    question.options.forEach(option => {
        const label = document.createElement('label');
        label.className = 'radio-option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = question.id;
        input.value = option;
        input.checked = answers[question.id] === option;
        input.addEventListener('change', (e) => {
            answers[question.id] = e.target.value;
        });
        
        const labelText = document.createElement('label');
        labelText.textContent = option;
        
        label.appendChild(input);
        label.appendChild(labelText);
        group.appendChild(label);
    });
    
    answerContainer.appendChild(group);
}

// Atualizar Botões
function updateButtons() {
    // Mostrar/esconder botão Voltar
    if (currentQuestion === 0) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'block';
    }
    
    // Mudar texto do botão Próximo
    if (currentQuestion === quizData.length - 1) {
        nextBtn.innerHTML = '<span>✓ Enviar</span>';
    } else {
        nextBtn.innerHTML = '<span>Próximo →</span>';
    }
}

// Atualizar Progresso
function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `${currentQuestion + 1}/${quizData.length}`;
}

// Validar Resposta
function validateAnswer() {
    const question = quizData[currentQuestion];
    const answer = answers[question.id];
    
    if (question.required && (!answer || answer.trim() === '')) {
        alert('Por favor, responda a pergunta antes de continuar.');
        return false;
    }
    
    return true;
}

// Próxima Pergunta
function handleNext() {
    if (!validateAnswer()) {
        return;
    }
    
    if (currentQuestion === quizData.length - 1) {
        submitQuiz();
    } else {
        currentQuestion++;
        loadQuestion();
    }
}

// Pergunta Anterior
function handleBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

// Enviar Quiz
async function submitQuiz() {
    if (isSubmitting) return;
    isSubmitting = true;
    nextBtn.disabled = true;
    
    try {
        // Formatar mensagem para WhatsApp
        const message = formatWhatsAppMessage();
        
        // Número do médico (você pode alterar este número)
        const phoneNumber = '5569999293370';
        
        // Criar URL do WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Mostrar mensagem de sucesso
        setTimeout(() => {
            showSuccessMessage();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao enviar:', error);
        alert('Erro ao enviar o formulário. Tente novamente.');
        isSubmitting = false;
        nextBtn.disabled = false;
    }
}

// Formatar Mensagem para WhatsApp
function formatWhatsAppMessage() {
    let message = 'Olá, Consulta Médica!\n\n';
    message += 'Dados do Paciente:\n';
    message += '═══════════════════════════════\n\n';
    
    // Mapear IDs para labels legíveis
    const labels = {
        nome: 'Nome Completo',
        sexo: 'Sexo',
        dataNascimento: 'Data de Nascimento',
        cpf: 'CPF',
        cep: 'CEP',
        numeroCasa: 'Número da Casa/Apartamento',
        motivoConsulta: 'Motivo da Consulta',
        doencaDiagnosticada: 'Doença Diagnosticada',
        medicamento: 'Medicamento em Uso',
        alergia: 'Alergia a Medicamento'
    };
    
    // Adicionar respostas
    quizData.forEach(question => {
        const answer = answers[question.id] || 'Não informado';
        const label = labels[question.id];
        message += `${label}: ${answer}\n`;
    });
    
    message += '\n═══════════════════════════════\n';
    message += `Enviado em: ${new Date().toLocaleString('pt-BR')}`;
    
    return message;
}

// Mostrar Mensagem de Sucesso
function showSuccessMessage() {
    const quizCard = document.querySelector('.quiz-card');
    quizCard.innerHTML = `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>Formulário Enviado!</h2>
            <p>Seus dados foram enviados com sucesso para o WhatsApp do Dr. André Alcântara.</p>
            <p style="font-size: 14px; color: #999; margin-bottom: 24px;">
                Você será redirecionado para o WhatsApp para confirmar o envio.
            </p>
            <button onclick="location.reload()" class="btn btn-primary" style="width: 100%; justify-content: center;">
                <span>Fazer Novo Formulário</span>
            </button>
        </div>
    `;
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);