/* ============================================================
   QUIZ DEFINITION — Teste de Perfil Capilar (Hairline Academy)
   Fonte única de perguntas, regras condicionais e motor de resultado.
   Carregado pelo navegador (window.QuizDefinition) e pelo servidor (require).
   Especificação: "perguntas oficiais" + Anexo Técnico de Lógica dos Resultados.
   ============================================================ */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizDefinition = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const QUIZ_VERSION = '2026-10-01';
  const IMG = '/img/quiz/';

  const STAGES = {
    perfil: 'Etapa 1 — Conhecendo seu perfil',
    mudanca: 'Etapa 2 — Como seu cabelo está mudando',
    queda: 'Etapa 3 — Entendendo melhor sua queda',
    sinais: 'Etapa 4 — Existe algum sinal que mereça atenção?',
    tratamento: 'Etapa 5 — O que você já fez pelo seu cabelo?',
    impacto: 'Etapa 6 — Como isso afeta você?',
    intencao: 'Etapa 7 — Intenção'
  };

  const QUESTIONS = [
    {
      id: 'q1', stage: 'perfil',
      title: 'Qual é o seu sexo?',
      options: [
        { id: 'masculino', text: 'Masculino' },
        { id: 'feminino', text: 'Feminino' }
      ]
    },
    {
      id: 'q2', stage: 'perfil',
      title: 'Qual é a sua idade?',
      options: [
        { id: 'menos_25', text: 'Menos de 25 anos' },
        { id: '25_34', text: '25 a 34 anos' },
        { id: '35_44', text: '35 a 44 anos' },
        { id: '45_54', text: '45 a 54 anos' },
        { id: '55_mais', text: '55 anos ou mais' }
      ]
    },
    {
      id: 'q3', stage: 'perfil',
      title: 'Há quanto tempo você percebeu os primeiros sinais de perda ou afinamento dos cabelos?',
      options: [
        { id: 'menos_6m', text: 'Menos de 6 meses', severity: 0 },
        { id: '6m_2a', text: 'Entre 6 meses e 2 anos', severity: 0.25 },
        { id: '2a_5a', text: 'Entre 2 e 5 anos', severity: 0.5, finding: 'primeiros sinais percebidos entre 2 e 5 anos atrás' },
        { id: 'mais_5a', text: 'Há mais de 5 anos', severity: 0.75, finding: 'primeiros sinais percebidos há mais de 5 anos' },
        { id: 'desde_jovem', text: 'Percebo desde muito jovem', severity: 1, finding: 'sinais percebidos desde muito jovem' }
      ]
    },
    {
      id: 'q4', stage: 'mudanca', layout: 'image',
      variants: {
        masculino: {
          title: 'Você percebe aumento das entradas ou recuo da linha da frente do cabelo?',
          options: [
            { id: 'nao', text: 'Não', caption: 'Linha frontal preservada', image: IMG + 'q4-homem-1.webp', severity: 0, negativeFinding: 'linha frontal preservada' },
            { id: 'discreto', text: 'Discreto', caption: 'Entradas iniciais', image: IMG + 'q4-homem-2.webp', severity: 0.33, finding: 'aumento discreto das entradas' },
            { id: 'moderado', text: 'Moderado', caption: 'Entradas mais evidentes', image: IMG + 'q4-homem-3.webp', severity: 0.66, finding: 'aumento moderado das entradas' },
            { id: 'acentuado', text: 'Acentuado', caption: 'Recuo importante da linha frontal', image: IMG + 'q4-homem-4.webp', severity: 1, finding: 'recuo importante da linha frontal' }
          ]
        },
        feminino: {
          title: 'Você percebe que a risca do cabelo está ficando mais larga ou que consegue enxergar mais o couro cabeludo no topo da cabeça?',
          options: [
            { id: 'nao', text: 'Não', caption: 'Risca fina e normal', image: IMG + 'q4-mulher-1.webp', severity: 0, negativeFinding: 'risca fina e normal' },
            { id: 'discretamente', text: 'Discretamente', caption: 'Leve alargamento da risca', image: IMG + 'q4-mulher-2.webp', severity: 0.33, finding: 'leve alargamento da risca' },
            { id: 'moderadamente', text: 'Moderadamente', caption: 'Risca visivelmente mais larga', image: IMG + 'q4-mulher-3.webp', severity: 0.66, finding: 'risca visivelmente mais larga' },
            { id: 'muito', text: 'Muito', caption: 'Couro cabeludo claramente visível', image: IMG + 'q4-mulher-4.webp', severity: 1, finding: 'couro cabeludo claramente visível no topo' }
          ]
        }
      }
    },
    {
      id: 'q5', stage: 'mudanca', layout: 'image',
      variants: {
        masculino: {
          title: 'Você percebe rarefação ou diminuição do volume na região do topo ou da coroa da cabeça?',
          options: [
            { id: 'nao', text: 'Não', caption: 'Boa densidade no topo', image: IMG + 'q5-1.webp', severity: 0, negativeFinding: 'boa densidade no topo' },
            { id: 'discreta', text: 'Discreta', caption: 'Leve rarefação no vértice', image: IMG + 'q5-2.webp', severity: 0.33, finding: 'leve rarefação no topo ou coroa' },
            { id: 'moderada', text: 'Moderada', caption: 'Rarefação mais evidente', image: IMG + 'q5-3.webp', severity: 0.66, finding: 'rarefação no topo' },
            { id: 'importante', text: 'Importante', caption: 'Área clara e bem visível', image: IMG + 'q5-4.webp', severity: 1, finding: 'rarefação importante no topo ou coroa' }
          ]
        },
        feminino: {
          title: 'Você percebe rarefação ou diminuição do volume na região do topo ou da coroa da cabeça?',
          options: [
            { id: 'nao', text: 'Não', caption: 'Boa densidade no topo', image: IMG + 'q5-mulher-1.webp', severity: 0, negativeFinding: 'boa densidade no topo' },
            { id: 'discreta', text: 'Discreta', caption: 'Leve rarefação no vértice', image: IMG + 'q5-mulher-2.webp', severity: 0.33, finding: 'leve rarefação no topo ou coroa' },
            { id: 'moderada', text: 'Moderada', caption: 'Rarefação mais evidente', image: IMG + 'q5-mulher-3.webp', severity: 0.66, finding: 'rarefação no topo' },
            { id: 'importante', text: 'Importante', caption: 'Área clara e bem visível', image: IMG + 'q5-mulher-4.webp', severity: 1, finding: 'rarefação importante no topo ou coroa' }
          ]
        }
      }
    },
    {
      id: 'q6', stage: 'mudanca', layout: 'image',
      title: 'Em ambientes com luz forte ou quando o cabelo está molhado, o couro cabeludo fica mais visível?',
      options: [
        { id: 'nao', text: 'Não', caption: 'Couro cabeludo não visível', image: IMG + 'q6-1.webp', severity: 0, negativeFinding: 'couro cabeludo pouco visível sob luz forte' },
        { id: 'um_pouco', text: 'Um pouco', caption: 'Leve visibilidade', image: IMG + 'q6-2.webp', severity: 0.33, finding: 'leve visibilidade do couro cabeludo sob luz forte' },
        { id: 'claramente', text: 'Claramente', caption: 'Couro cabeludo visível', image: IMG + 'q6-3.webp', severity: 0.66, finding: 'maior visibilidade do couro cabeludo sob luz forte' },
        { id: 'muito_evidente', text: 'Muito evidente', caption: 'Couro cabeludo bem visível', image: IMG + 'q6-4.webp', severity: 1, finding: 'couro cabeludo muito visível sob luz forte ou com o cabelo molhado' }
      ]
    },
    {
      id: 'q7', stage: 'mudanca',
      title: 'Comparando com alguns anos atrás, você sente que seu cabelo perdeu volume ou densidade?',
      options: [
        { id: 'nao', text: 'Não', severity: 0, negativeFinding: 'nenhuma perda de volume perceptível nos últimos anos' },
        { id: 'um_pouco', text: 'Um pouco', severity: 0.33, finding: 'alguma perda de volume em relação a alguns anos atrás' },
        { id: 'bastante', text: 'Bastante', severity: 0.66, finding: 'perda de volume e densidade em relação a alguns anos atrás' },
        { id: 'muito', text: 'Muito', severity: 1, finding: 'perda importante de volume e densidade nos últimos anos' }
      ]
    },
    {
      id: 'q8', stage: 'mudanca',
      title: 'Você percebe que os fios nas áreas mais ralas estão ficando progressivamente mais finos?',
      options: [
        { id: 'nao_percebo', text: 'Não percebo', severity: 0 },
        { id: 'um_pouco', text: 'Um pouco', severity: 0.5, finding: 'algum afinamento dos fios' },
        { id: 'claramente', text: 'Claramente', severity: 1, finding: 'afinamento progressivo dos fios' }
      ]
    },
    {
      id: 'q9', stage: 'mudanca',
      title: 'Você observa queda de cabelo acima do habitual no banho, no travesseiro ou ao pentear?',
      options: [
        { id: 'nao', text: 'Não', severity: 0 },
        { id: 'as_vezes', text: 'Às vezes', severity: 0.33, finding: 'queda acima do habitual em alguns momentos' },
        { id: 'frequentemente', text: 'Frequentemente', severity: 0.66, finding: 'queda frequente acima do habitual' },
        { id: 'muito', text: 'Muito', severity: 1, finding: 'queda intensa no banho, no travesseiro ou ao pentear' }
      ]
    },
    {
      id: 'q10', stage: 'mudanca',
      title: 'Existem casos de calvície ou afinamento importante dos cabelos na sua família?',
      options: [
        { id: 'nao_sei', text: 'Não que eu saiba', severity: 0 },
        { id: 'paterno', text: 'Sim, no lado paterno', severity: 0.5, finding: 'histórico familiar de calvície (lado paterno)' },
        { id: 'materno', text: 'Sim, no lado materno', severity: 0.5, finding: 'histórico familiar de calvície (lado materno)' },
        { id: 'ambos', text: 'Sim, nos dois lados', severity: 1, finding: 'histórico familiar de calvície nos dois lados da família' }
      ]
    },
    {
      id: 'q11', stage: 'queda',
      title: 'A sua perda de cabelo aconteceu de forma gradual ou começou de repente?',
      options: [
        { id: 'gradual', text: 'Foi acontecendo gradualmente' },
        { id: 'subito', text: 'Começou de repente' },
        { id: 'nao_sei', text: 'Não sei dizer' }
      ]
    },
    {
      id: 'q12', stage: 'queda', layout: 'image',
      title: 'Onde você percebe mais a perda de cabelo?',
      subtitle: 'Selecione a opção que mais se parece com o seu caso.',
      options: [
        { id: 'frontal', text: 'Principalmente na frente (linha frontal)', caption: 'Queda mais evidente na linha frontal / entradas.', image: IMG + 'q12-1.webp?v=20261005b', severity: 0.35, finding: 'perda concentrada nas entradas ou na linha frontal' },
        { id: 'topo', text: 'Principalmente no topo (coroa/vértice)', caption: 'Queda mais evidente no topo da cabeça (coroa/vértice).', image: IMG + 'q12-2.webp?v=20261005b', severity: 0.35, finding: 'perda concentrada no topo ou na coroa' },
        { id: 'varias', text: 'Em várias regiões (frente e topo)', caption: 'Perda de cabelo na linha frontal e no topo.', image: IMG + 'q12-3.webp?v=20261005b', severity: 0.85, finding: 'perda em várias regiões da cabeça' },
        { id: 'difusa', text: 'De forma difusa (por toda a cabeça)', caption: 'Redução geral da densidade dos fios em toda a cabeça.', image: IMG + 'q12-4.webp?v=20261024', severity: 0.6, finding: 'perda difusa por toda a cabeça' },
        { id: 'nao_identifico', text: 'Não consigo identificar', caption: 'Não percebo áreas específicas de calvície ou tenho dificuldade em identificar.', image: IMG + 'q12-5.webp?v=20261005b', severity: 0.15 }
      ]
    },
    {
      id: 'q13', stage: 'queda', multiple: true,
      title: 'Nos últimos meses, você passou por alguma destas situações?',
      subtitle: 'Você pode marcar mais de uma opção.',
      options: [
        { id: 'estresse', text: 'Estresse emocional intenso', label: 'estresse emocional intenso' },
        { id: 'doenca_cirurgia', text: 'Doença ou cirurgia', label: 'doença ou cirurgia' },
        { id: 'perda_peso', text: 'Perda importante de peso', label: 'perda importante de peso' },
        { id: 'dieta', text: 'Dieta muito restritiva ou mudança importante na alimentação', label: 'mudança importante na alimentação' },
        { id: 'pos_parto', text: 'Pós-parto', label: 'pós-parto', onlyFor: 'feminino' },
        { id: 'nenhuma', text: 'Nenhuma dessas situações', exclusive: true }
      ]
    },
    {
      id: 'q14', stage: 'queda',
      title: 'Você usa ou já usou testosterona, anabolizantes ou outros hormônios com finalidade de reposição, estética ou performance?',
      options: [
        { id: 'nunca', text: 'Nunca' },
        { id: 'usei', text: 'Usei anteriormente' },
        { id: 'uso_atual', text: 'Uso atualmente' }
      ]
    },
    {
      id: 'q15', stage: 'sinais', multiple: true,
      title: 'Além da queda, você percebe algum destes sinais no couro cabeludo?',
      subtitle: 'Você pode marcar mais de uma opção.',
      options: [
        { id: 'coceira', text: 'Coceira intensa', label: 'coceira intensa' },
        { id: 'descamacao', text: 'Descamação importante', label: 'descamação importante' },
        { id: 'dor', text: 'Dor ou ardência', label: 'dor ou ardência', critical: true },
        { id: 'feridas', text: 'Feridas', label: 'feridas', critical: true },
        { id: 'cicatriz', text: 'Áreas com aspecto de cicatriz', label: 'áreas com aspecto de cicatriz', critical: true },
        { id: 'falhas', text: 'Falhas bem delimitadas ou arredondadas', label: 'falhas bem delimitadas ou arredondadas', critical: true },
        { id: 'nenhum', text: 'Nenhum desses sinais', exclusive: true }
      ]
    },
    {
      id: 'q16', stage: 'tratamento',
      title: 'Você já fez algum tratamento para queda ou calvície?',
      options: [
        { id: 'nunca', text: 'Nunca' },
        { id: 'cosmeticos', text: 'Apenas cosméticos ou suplementos' },
        { id: 'medicamentos', text: 'Medicamentos' },
        { id: 'procedimentos', text: 'Procedimentos ou tratamentos em clínica' },
        { id: 'transplante', text: 'Transplante capilar' },
        { id: 'varios', text: 'Já tentei mais de uma dessas opções' }
      ]
    },
    {
      id: 'q17', stage: 'tratamento',
      title: 'Se já tratou, como avalia os resultados obtidos?',
      showIf: (answers) => answers.q16 !== 'nunca',
      options: [
        { id: 'nao_fiz', text: 'Não fiz tratamento' },
        { id: 'satisfatorio', text: 'Tive um resultado satisfatório' },
        { id: 'parcial', text: 'Melhorou parcialmente' },
        { id: 'sem_melhora', text: 'Não percebi melhora' },
        { id: 'progrediu', text: 'O problema continuou progredindo' }
      ]
    },
    {
      id: 'q18', stage: 'impacto',
      title: 'O quanto a situação do seu cabelo incomoda você atualmente?',
      options: [
        { id: 'nao', text: 'Não incomoda' },
        { id: 'pouco', text: 'Incomoda pouco' },
        { id: 'moderado', text: 'Incomoda moderadamente' },
        { id: 'muito', text: 'Incomoda muito' }
      ]
    },
    {
      id: 'q19', stage: 'impacto',
      title: 'O que você mais gostaria de melhorar no seu cabelo hoje?',
      options: [
        { id: 'queda', text: 'Diminuir ou controlar a queda' },
        { id: 'volume', text: 'Recuperar volume e densidade' },
        { id: 'entradas', text: 'Melhorar as entradas ou a linha frontal' },
        { id: 'coroa', text: 'Melhorar o topo ou a coroa' },
        { id: 'testa', text: 'Reduzir visualmente o tamanho da testa' },
        { id: 'entender', text: 'Entender primeiro o que está acontecendo' }
      ]
    },
    {
      id: 'q20', stage: 'intencao',
      title: 'Se existisse uma opção adequada para o seu caso, qual seria seu próximo passo?',
      options: [
        { id: 'agora', text: 'Quero buscar uma solução agora' },
        { id: 'conhecer', text: 'Quero conhecer melhor as opções antes de decidir' },
        { id: 'informar', text: 'Neste momento, quero apenas me informar' }
      ]
    }
  ];

  // Camada A — índice estrutural (padrão e densidade). Pesos relativos do Anexo Técnico, item 3.
  const STRUCTURAL_WEIGHTS = { q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q12: 3, q3: 1.5, q9: 0.75, q10: 0.75 };

  // Limiares iniciais do índice (0 a 1). Calibrar com casos reais classificados por avaliação médica (Anexo, item 12).
  const LEVEL_THRESHOLDS = { leveMax: 0.35, moderadoMax: 0.70 };
  const FOREHEAD_EXCEPTION_MAX_INDEX = 0.20;
  const MAX_FINDINGS = 4;
  const MIN_FINDINGS = 2;

  const LEVELS = {
    leve: { key: 'leve', label: 'Leve', title: 'LEVE', page: '/calvicie-leve.html' },
    moderado: { key: 'moderado', label: 'Moderado', title: 'MODERADO', page: '/calvicie-moderada.html' },
    avancado: { key: 'avancado', label: 'Avançado', title: 'AVANÇADO', page: '/calvicie-avancada.html' }
  };

  const FOREHEAD_MESSAGE = 'Seu principal objetivo parece estar relacionado ao desenho da linha frontal, e não necessariamente a uma perda capilar importante.';
  const DISCLAIMER = 'Este teste tem caráter educativo e não substitui diagnóstico ou avaliação médica.';

  // ---------- Helpers ----------
  function getQuestion(id) {
    return QUESTIONS.find(q => q.id === id) || null;
  }

  function resolveQuestion(question, answers) {
    if (!question.variants) return question;
    const variant = question.variants[answers.q1] || question.variants.masculino;
    return Object.assign({}, question, variant);
  }

  function getVisibleOptions(question, answers) {
    return question.options.filter(opt => !opt.onlyFor || opt.onlyFor === answers.q1);
  }

  function isQuestionVisible(question, answers) {
    return typeof question.showIf !== 'function' || question.showIf(answers);
  }

  function getVisibleQuestions(answers) {
    return QUESTIONS.filter(q => isQuestionVisible(q, answers)).map(q => resolveQuestion(q, answers));
  }

  function findOption(question, optionId) {
    return question.options.find(o => o.id === optionId) || null;
  }

  function joinList(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1];
  }

  // ---------- Validation (servidor e navegador) ----------
  function validateAnswers(answers) {
    const errors = [];
    if (!answers || typeof answers !== 'object') return { isValid: false, errors: ['Respostas ausentes.'] };

    for (const question of getVisibleQuestions(answers)) {
      const value = answers[question.id];
      const validIds = getVisibleOptions(question, answers).map(o => o.id);

      if (question.multiple) {
        if (!Array.isArray(value) || !value.length) { errors.push(`${question.id}: resposta obrigatória`); continue; }
        if (value.some(v => !validIds.includes(v))) { errors.push(`${question.id}: opção inválida`); continue; }
        const exclusive = question.options.find(o => o.exclusive);
        if (exclusive && value.includes(exclusive.id) && value.length > 1) errors.push(`${question.id}: "${exclusive.text}" não combina com outras opções`);
      } else if (!validIds.includes(value)) {
        errors.push(`${question.id}: resposta obrigatória`);
      }
    }
    return { isValid: errors.length === 0, errors };
  }

  // ---------- Camada A: índice estrutural ----------
  function computeStructuralIndex(answers) {
    let weighted = 0;
    let totalWeight = 0;
    for (const [questionId, weight] of Object.entries(STRUCTURAL_WEIGHTS)) {
      const question = resolveQuestion(getQuestion(questionId), answers);
      const option = findOption(question, answers[questionId]);
      totalWeight += weight;
      weighted += weight * ((option && option.severity) || 0);
    }
    return totalWeight ? weighted / totalWeight : 0;
  }

  function getLevelFromIndex(index) {
    if (index <= LEVEL_THRESHOLDS.leveMax) return LEVELS.leve;
    if (index <= LEVEL_THRESHOLDS.moderadoMax) return LEVELS.moderado;
    return LEVELS.avancado;
  }

  // ---------- Achados reais do próprio usuário ("O que suas respostas mostraram") ----------
  // A região (Q12) só vira achado quando não repete o que Q4 (frente) ou Q5 (topo) já mostraram.
  function isRedundantRegion(questionId, answers) {
    if (questionId !== 'q12') return false;
    const hasFrontFinding = answers.q4 && answers.q4 !== 'nao';
    const hasTopFinding = answers.q5 && answers.q5 !== 'nao';
    return (answers.q12 === 'frontal' && hasFrontFinding) || (answers.q12 === 'topo' && hasTopFinding);
  }

  function buildFindings(answers) {
    const positives = [];
    const negatives = [];
    for (const [questionId, weight] of Object.entries(STRUCTURAL_WEIGHTS)) {
      const question = resolveQuestion(getQuestion(questionId), answers);
      const option = findOption(question, answers[questionId]);
      if (!option || isRedundantRegion(questionId, answers)) continue;
      if (option.finding) positives.push({ text: option.finding, relevance: weight * (option.severity || 0) });
      else if (option.negativeFinding) negatives.push(option.negativeFinding);
    }
    positives.sort((a, b) => b.relevance - a.relevance);

    const findings = positives.slice(0, MAX_FINDINGS).map(f => f.text);
    for (const negative of negatives) {
      if (findings.length >= MIN_FINDINGS) break;
      findings.push(negative);
    }
    return findings;
  }

  // ---------- Camada B: alertas clínicos (não alteram o perfil) ----------
  function buildAlerts(answers) {
    const alerts = [];

    const scalpSigns = (answers.q15 || []).filter(id => id !== 'nenhum');
    if (scalpSigns.length) {
      const q15 = getQuestion('q15');
      const critical = scalpSigns.map(id => findOption(q15, id)).filter(o => o && o.critical).map(o => o.label);
      let text = 'Algumas das suas respostas indicam sinais que podem ter outras causas além da calvície comum. Uma avaliação médica pode ser importante para esclarecer a origem da alteração antes de definir qualquer tratamento.';
      if (critical.length) text += ` Como você relatou ${joinList(critical)}, recomendamos priorizar essa avaliação médica.`;
      alerts.push({ key: 'couro_cabeludo', title: 'Atenção aos sinais no couro cabeludo', text, isPriority: true });
    }

    if (answers.q11 === 'subito') {
      alerts.push({
        key: 'inicio_subito',
        title: 'Queda de início súbito',
        text: 'Quedas que começam de repente podem ter causas diferentes da calvície comum e merecem avaliação profissional.',
        isPriority: false
      });
    }

    const recentEvents = (answers.q13 || []).filter(id => id !== 'nenhuma');
    if (recentEvents.length) {
      const q13 = getQuestion('q13');
      const labels = recentEvents.map(id => findOption(q13, id)).filter(Boolean).map(o => o.label);
      alerts.push({
        key: 'fatores_recentes',
        title: 'Eventos recentes',
        text: `Você relatou ${joinList(labels)}. Eventos recentes como esses podem estar associados a aumento de queda, e uma avaliação pode esclarecer a causa.`,
        isPriority: false
      });
    }

    return alerts;
  }

  // ---------- Camada C: CRM e segmentação (zero influência no perfil) ----------
  function buildTags(answers, level, alerts) {
    const tags = ['PERFIL_' + level.key.toUpperCase()];
    if (alerts.length) tags.push('ALERTA_CLINICO');
    if (answers.q12 === 'frontal' || answers.q12 === 'varias') tags.push('FRONTAL');
    if (answers.q12 === 'topo' || answers.q12 === 'varias') tags.push('COROA');
    if (answers.q12 === 'difusa') tags.push('DIFUSA');
    if (answers.q16 && answers.q16 !== 'nunca') tags.push('TRATAMENTO_PREVIO');
    if (answers.q16 === 'transplante') tags.push('TRANSPLANTE_PREVIO');
    const intentTags = { agora: 'INTENCAO_AGORA', conhecer: 'CONSIDERANDO', informar: 'INFORMACAO' };
    if (intentTags[answers.q20]) tags.push(intentTags[answers.q20]);
    if (answers.q19 === 'testa') tags.push('REDUCAO_TESTA');
    return tags;
  }

  function optionText(questionId, answers) {
    const question = resolveQuestion(getQuestion(questionId), answers);
    const option = findOption(question, answers[questionId]);
    return option ? option.text : null;
  }

  function buildCrmProfile(answers) {
    return {
      sex: optionText('q1', answers),
      ageRange: optionText('q2', answers),
      region: optionText('q12', answers),
      previousTreatment: optionText('q16', answers),
      botherLevel: optionText('q18', answers),
      mainGoal: optionText('q19', answers),
      intent: optionText('q20', answers)
    };
  }

  // ---------- Resultado completo ----------
  function computeResult(answers) {
    const structuralIndex = computeStructuralIndex(answers);
    const level = getLevelFromIndex(structuralIndex);
    const alerts = buildAlerts(answers);
    const findings = buildFindings(answers);
    const isForeheadException = answers.q19 === 'testa' && structuralIndex <= FOREHEAD_EXCEPTION_MAX_INDEX;

    return {
      quizVersion: QUIZ_VERSION,
      structuralIndex: Math.round(structuralIndex * 1000) / 1000,
      level: level.key,
      levelLabel: level.label,
      levelTitle: level.title,
      findings,
      findingsText: findings.length ? `Você relatou ${joinList(findings)}.` : '',
      alerts,
      hasAlert: alerts.length > 0,
      isForeheadException,
      foreheadMessage: isForeheadException ? FOREHEAD_MESSAGE : null,
      tags: buildTags(answers, level, alerts),
      crm: buildCrmProfile(answers)
    };
  }

  // Respostas legíveis (pergunta + texto escolhido) para o painel administrativo.
  function describeAnswers(answers) {
    return getVisibleQuestions(answers).map(question => {
      const value = answers[question.id];
      const ids = Array.isArray(value) ? value : [value];
      const texts = ids.map(id => findOption(question, id)).filter(Boolean).map(o => o.text);
      return { questionId: question.id, question: question.title, answer: texts.join('; ') };
    });
  }

  return {
    QUIZ_VERSION,
    STAGES,
    QUESTIONS,
    LEVELS,
    DISCLAIMER,
    FOREHEAD_MESSAGE,
    getVisibleQuestions,
    getVisibleOptions,
    validateAnswers,
    computeResult,
    describeAnswers
  };
});
