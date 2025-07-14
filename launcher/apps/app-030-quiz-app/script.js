class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.selectedAnswer = null;
        this.userAnswers = [];
        this.quizSettings = {
            category: 'general',
            difficulty: 'medium',
            questionCount: 10,
            timeLimit: 30
        };
        this.statistics = {
            totalQuizzes: 0,
            totalScore: 0,
            bestScore: 0,
            totalCorrect: 0,
            categoryStats: {}
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStatistics();
        this.updateUI();
    }
    
    initializeElements() {
        // Quiz sections
        this.quizSetup = document.getElementById('quizSetup');
        this.quizGame = document.getElementById('quizGame');
        this.quizResults = document.getElementById('quizResults');
        this.answerReview = document.getElementById('answerReview');
        this.sidePanel = document.getElementById('sidePanel');
        
        // Setup elements
        this.categorySelect = document.getElementById('category');
        this.difficultySelect = document.getElementById('difficulty');
        this.questionCountSelect = document.getElementById('questionCount');
        this.timeLimitSelect = document.getElementById('timeLimit');
        this.startQuizBtn = document.getElementById('startQuiz');
        
        // Game elements
        this.currentQuestionEl = document.getElementById('currentQuestion');
        this.totalQuestionsEl = document.getElementById('totalQuestions');
        this.timerEl = document.getElementById('timer');
        this.scoreEl = document.getElementById('score');
        this.progressFill = document.getElementById('progressFill');
        this.questionText = document.getElementById('questionText');
        this.answersContainer = document.getElementById('answers');
        this.nextBtn = document.getElementById('nextBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.quitBtn = document.getElementById('quitBtn');
        
        // Results elements
        this.finalScore = document.getElementById('finalScore');
        this.correctAnswers = document.getElementById('correctAnswers');
        this.incorrectAnswers = document.getElementById('incorrectAnswers');
        this.skippedAnswers = document.getElementById('skippedAnswers');
        this.accuracy = document.getElementById('accuracy');
        this.performanceBadge = document.getElementById('performanceBadge');
        this.reviewAnswersBtn = document.getElementById('reviewAnswers');
        this.playAgainBtn = document.getElementById('playAgain');
        this.shareResultsBtn = document.getElementById('shareResults');
        
        // Review elements
        this.reviewList = document.getElementById('reviewList');
        this.backToResultsBtn = document.getElementById('backToResults');
        
        // UI controls
        this.themeToggle = document.getElementById('themeToggle');
        this.statsToggle = document.getElementById('statsToggle');
        
        // Statistics elements
        this.totalQuizzesEl = document.getElementById('totalQuizzes');
        this.averageScoreEl = document.getElementById('averageScore');
        this.bestScoreEl = document.getElementById('bestScore');
        this.totalCorrectEl = document.getElementById('totalCorrect');
        this.categoryChart = document.getElementById('categoryChart');
        this.recentScores = document.getElementById('recentScores');
    }
    
    setupEventListeners() {
        // Setup controls
        this.startQuizBtn.addEventListener('click', () => this.startQuiz());
        this.categorySelect.addEventListener('change', () => this.updateQuizSettings());
        this.difficultySelect.addEventListener('change', () => this.updateQuizSettings());
        this.questionCountSelect.addEventListener('change', () => this.updateQuizSettings());
        this.timeLimitSelect.addEventListener('change', () => this.updateQuizSettings());
        
        // Game controls
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.quitBtn.addEventListener('click', () => this.quitQuiz());
        
        // Results controls
        this.reviewAnswersBtn.addEventListener('click', () => this.showAnswerReview());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.shareResultsBtn.addEventListener('click', () => this.shareResults());
        this.backToResultsBtn.addEventListener('click', () => this.backToResults());
        
        // UI controls\n        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.statsToggle.addEventListener('click', () => this.toggleStats());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    updateQuizSettings() {
        this.quizSettings.category = this.categorySelect.value;
        this.quizSettings.difficulty = this.difficultySelect.value;
        this.quizSettings.questionCount = parseInt(this.questionCountSelect.value);
        this.quizSettings.timeLimit = parseInt(this.timeLimitSelect.value);
        this.saveSettings();
    }
    
    async startQuiz() {
        this.showSection('game');
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.selectedAnswer = null;
        
        // Generate questions
        this.questions = this.generateQuestions();
        
        this.totalQuestionsEl.textContent = this.questions.length;
        this.updateProgress();
        this.loadQuestion();
        
        if (this.quizSettings.timeLimit > 0) {
            this.startTimer();
        } else {
            this.timerEl.textContent = '∞';
        }
    }
    
    generateQuestions() {
        const questionPool = this.getQuestionPool();
        const categoryQuestions = questionPool[this.quizSettings.category] || questionPool.general;
        const difficultyQuestions = categoryQuestions[this.quizSettings.difficulty] || categoryQuestions.medium;
        
        // Shuffle and select questions
        const shuffled = [...difficultyQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, this.quizSettings.questionCount);
    }
    
    getQuestionPool() {
        return {
            general: {
                easy: [
                    {
                        question: \"What is the capital of France?\",
                        answers: [\"London\", \"Berlin\", \"Paris\", \"Madrid\"],
                        correct: 2
                    },
                    {
                        question: \"What is 2 + 2?\",
                        answers: [\"3\", \"4\", \"5\", \"6\"],
                        correct: 1
                    },
                    {
                        question: \"What color do you get when you mix red and blue?\",
                        answers: [\"Green\", \"Purple\", \"Orange\", \"Yellow\"],
                        correct: 1
                    },
                    {
                        question: \"How many days are in a week?\",
                        answers: [\"6\", \"7\", \"8\", \"9\"],
                        correct: 1
                    },
                    {
                        question: \"What is the largest planet in our solar system?\",
                        answers: [\"Earth\", \"Mars\", \"Jupiter\", \"Saturn\"],
                        correct: 2
                    }
                ],
                medium: [
                    {
                        question: \"Which element has the chemical symbol 'O'?\",
                        answers: [\"Gold\", \"Silver\", \"Oxygen\", \"Iron\"],
                        correct: 2
                    },
                    {
                        question: \"Who painted the Mona Lisa?\",
                        answers: [\"Vincent van Gogh\", \"Leonardo da Vinci\", \"Pablo Picasso\", \"Michelangelo\"],
                        correct: 1
                    },
                    {
                        question: \"What is the speed of light?\",
                        answers: [\"300,000 km/s\", \"150,000 km/s\", \"450,000 km/s\", \"600,000 km/s\"],
                        correct: 0
                    },
                    {
                        question: \"Which country is home to Machu Picchu?\",
                        answers: [\"Chile\", \"Peru\", \"Ecuador\", \"Bolivia\"],
                        correct: 1
                    },
                    {
                        question: \"What is the smallest country in the world?\",
                        answers: [\"Monaco\", \"Vatican City\", \"San Marino\", \"Liechtenstein\"],
                        correct: 1
                    }
                ],
                hard: [
                    {
                        question: \"What is the Heisenberg Uncertainty Principle?\",
                        answers: [\"A cooking method\", \"A quantum physics principle\", \"A mathematical theorem\", \"A computer algorithm\"],
                        correct: 1
                    },
                    {
                        question: \"Which author wrote 'Ulysses'?\",
                        answers: [\"James Joyce\", \"Virginia Woolf\", \"T.S. Eliot\", \"Samuel Beckett\"],
                        correct: 0
                    },
                    {
                        question: \"What is the half-life of Carbon-14?\",
                        answers: [\"5,730 years\", \"1,000 years\", \"10,000 years\", \"50,000 years\"],
                        correct: 0
                    },
                    {
                        question: \"Which battle marked the end of Napoleon's Hundred Days?\",
                        answers: [\"Battle of Austerlitz\", \"Battle of Waterloo\", \"Battle of Leipzig\", \"Battle of Borodino\"],
                        correct: 1
                    },
                    {
                        question: \"What is the Goldbach Conjecture?\",
                        answers: [\"Every even number > 2 is sum of two primes\", \"Pi is irrational\", \"There are infinite prime numbers\", \"Fermat's Last Theorem\"],
                        correct: 0
                    }
                ]
            },
            science: {
                easy: [
                    {
                        question: \"What gas do plants absorb from the atmosphere?\",
                        answers: [\"Oxygen\", \"Carbon Dioxide\", \"Nitrogen\", \"Hydrogen\"],
                        correct: 1
                    },
                    {
                        question: \"How many bones are in the human body?\",
                        answers: [\"206\", \"156\", \"306\", \"256\"],
                        correct: 0
                    },
                    {
                        question: \"What is the chemical symbol for water?\",
                        answers: [\"H2O\", \"CO2\", \"NaCl\", \"O2\"],
                        correct: 0
                    },
                    {
                        question: \"Which organ in the human body produces insulin?\",
                        answers: [\"Liver\", \"Pancreas\", \"Kidney\", \"Heart\"],
                        correct: 1
                    },
                    {
                        question: \"What is the hardest natural substance on Earth?\",
                        answers: [\"Gold\", \"Iron\", \"Diamond\", \"Platinum\"],
                        correct: 2
                    }
                ],
                medium: [
                    {
                        question: \"What is the powerhouse of the cell?\",
                        answers: [\"Nucleus\", \"Mitochondria\", \"Ribosome\", \"Endoplasmic Reticulum\"],
                        correct: 1
                    },
                    {
                        question: \"Which scientist developed the theory of evolution?\",
                        answers: [\"Albert Einstein\", \"Charles Darwin\", \"Isaac Newton\", \"Galileo Galilei\"],
                        correct: 1
                    },
                    {
                        question: \"What is the pH of pure water?\",
                        answers: [\"6\", \"7\", \"8\", \"9\"],
                        correct: 1
                    },
                    {
                        question: \"Which planet is known as the Red Planet?\",
                        answers: [\"Venus\", \"Mars\", \"Jupiter\", \"Saturn\"],
                        correct: 1
                    },
                    {
                        question: \"What type of bond holds water molecules together?\",
                        answers: [\"Ionic\", \"Covalent\", \"Hydrogen\", \"Metallic\"],
                        correct: 2
                    }
                ],
                hard: [
                    {
                        question: \"What is the standard model of particle physics?\",
                        answers: [\"A theory of fundamental particles\", \"A model of the atom\", \"A theory of gravity\", \"A model of the universe\"],
                        correct: 0
                    },
                    {
                        question: \"Which enzyme breaks down starch?\",
                        answers: [\"Pepsin\", \"Trypsin\", \"Amylase\", \"Lipase\"],
                        correct: 2
                    },
                    {
                        question: \"What is the Chandrasekhar limit?\",
                        answers: [\"Maximum mass of a white dwarf\", \"Speed of light\", \"Planck's constant\", \"Avogadro's number\"],
                        correct: 0
                    },
                    {
                        question: \"Which organelle is responsible for protein synthesis?\",
                        answers: [\"Golgi apparatus\", \"Ribosome\", \"Lysosome\", \"Peroxisome\"],
                        correct: 1
                    },
                    {
                        question: \"What is the most abundant element in the universe?\",
                        answers: [\"Oxygen\", \"Carbon\", \"Hydrogen\", \"Helium\"],
                        correct: 2
                    }
                ]
            },
            history: {
                easy: [
                    {
                        question: \"When did World War II end?\",
                        answers: [\"1944\", \"1945\", \"1946\", \"1947\"],
                        correct: 1
                    },
                    {
                        question: \"Who was the first President of the United States?\",
                        answers: [\"Thomas Jefferson\", \"George Washington\", \"John Adams\", \"Benjamin Franklin\"],
                        correct: 1
                    },
                    {
                        question: \"In which year did the Berlin Wall fall?\",
                        answers: [\"1987\", \"1988\", \"1989\", \"1990\"],
                        correct: 2
                    },
                    {
                        question: \"Which ancient wonder of the world was located in Egypt?\",
                        answers: [\"Hanging Gardens\", \"Colossus of Rhodes\", \"Great Pyramid of Giza\", \"Lighthouse of Alexandria\"],
                        correct: 2
                    },
                    {
                        question: \"Who wrote the Declaration of Independence?\",
                        answers: [\"George Washington\", \"Thomas Jefferson\", \"Benjamin Franklin\", \"John Adams\"],
                        correct: 1
                    }
                ],
                medium: [
                    {
                        question: \"Which empire was ruled by Julius Caesar?\",
                        answers: [\"Greek Empire\", \"Roman Empire\", \"Persian Empire\", \"Ottoman Empire\"],
                        correct: 1
                    },
                    {
                        question: \"When did the French Revolution begin?\",
                        answers: [\"1789\", \"1799\", \"1779\", \"1809\"],
                        correct: 0
                    },
                    {
                        question: \"Who was the leader of the Soviet Union during World War II?\",
                        answers: [\"Vladimir Lenin\", \"Joseph Stalin\", \"Nikita Khrushchev\", \"Mikhail Gorbachev\"],
                        correct: 1
                    },
                    {
                        question: \"Which civilization built Machu Picchu?\",
                        answers: [\"Aztec\", \"Maya\", \"Inca\", \"Olmec\"],
                        correct: 2
                    },
                    {
                        question: \"In which year did Columbus reach the Americas?\",
                        answers: [\"1490\", \"1491\", \"1492\", \"1493\"],
                        correct: 2
                    }
                ],
                hard: [
                    {
                        question: \"Which treaty ended World War I?\",
                        answers: [\"Treaty of Versailles\", \"Treaty of Paris\", \"Treaty of Vienna\", \"Treaty of Westphalia\"],
                        correct: 0
                    },
                    {
                        question: \"Who was the last Emperor of Russia?\",
                        answers: [\"Nicholas I\", \"Alexander III\", \"Nicholas II\", \"Alexander II\"],
                        correct: 2
                    },
                    {
                        question: \"Which battle is considered the turning point of World War II in Europe?\",
                        answers: [\"Battle of Britain\", \"Battle of Stalingrad\", \"D-Day\", \"Battle of Kursk\"],
                        correct: 1
                    },
                    {
                        question: \"What was the Silk Road?\",
                        answers: [\"A trade route\", \"A Chinese dynasty\", \"A type of fabric\", \"A military campaign\"],
                        correct: 0
                    },
                    {
                        question: \"Which dynasty unified China for the first time?\",
                        answers: [\"Han Dynasty\", \"Qin Dynasty\", \"Tang Dynasty\", \"Ming Dynasty\"],
                        correct: 1
                    }
                ]
            },
            geography: {
                easy: [
                    {
                        question: \"What is the largest continent?\",
                        answers: [\"Africa\", \"Asia\", \"North America\", \"Europe\"],
                        correct: 1
                    },
                    {
                        question: \"Which river is the longest in the world?\",
                        answers: [\"Amazon\", \"Nile\", \"Mississippi\", \"Yangtze\"],
                        correct: 1
                    },
                    {
                        question: \"What is the capital of Australia?\",
                        answers: [\"Sydney\", \"Melbourne\", \"Canberra\", \"Perth\"],
                        correct: 2
                    },
                    {
                        question: \"Which mountain range contains Mount Everest?\",
                        answers: [\"Andes\", \"Rocky Mountains\", \"Alps\", \"Himalayas\"],
                        correct: 3
                    },
                    {
                        question: \"What is the smallest ocean?\",
                        answers: [\"Arctic Ocean\", \"Indian Ocean\", \"Atlantic Ocean\", \"Pacific Ocean\"],
                        correct: 0
                    }
                ],
                medium: [
                    {
                        question: \"Which country has the most time zones?\",
                        answers: [\"United States\", \"Russia\", \"China\", \"France\"],
                        correct: 3
                    },
                    {
                        question: \"What is the deepest point in the ocean?\",
                        answers: [\"Mariana Trench\", \"Puerto Rico Trench\", \"Java Trench\", \"Philippine Trench\"],
                        correct: 0
                    },
                    {
                        question: \"Which desert is the largest in the world?\",
                        answers: [\"Sahara\", \"Gobi\", \"Antarctica\", \"Arabian\"],
                        correct: 2
                    },
                    {
                        question: \"What is the longest mountain range in the world?\",
                        answers: [\"Himalayas\", \"Andes\", \"Rocky Mountains\", \"Alps\"],
                        correct: 1
                    },
                    {
                        question: \"Which country is completely surrounded by South Africa?\",
                        answers: [\"Swaziland\", \"Lesotho\", \"Botswana\", \"Namibia\"],
                        correct: 1
                    }
                ],
                hard: [
                    {
                        question: \"Which strait separates Europe and Asia?\",
                        answers: [\"Strait of Gibraltar\", \"Bosphorus\", \"Strait of Hormuz\", \"Strait of Malacca\"],
                        correct: 1
                    },
                    {
                        question: \"What is the highest waterfall in the world?\",
                        answers: [\"Niagara Falls\", \"Victoria Falls\", \"Angel Falls\", \"Iguazu Falls\"],
                        correct: 2
                    },
                    {
                        question: \"Which tectonic plate is the largest?\",
                        answers: [\"Eurasian Plate\", \"Pacific Plate\", \"North American Plate\", \"African Plate\"],
                        correct: 1
                    },
                    {
                        question: \"What is the driest place on Earth?\",
                        answers: [\"Sahara Desert\", \"Atacama Desert\", \"Death Valley\", \"Gobi Desert\"],
                        correct: 1
                    },
                    {
                        question: \"Which sea is the saltiest?\",
                        answers: [\"Dead Sea\", \"Red Sea\", \"Mediterranean Sea\", \"Caspian Sea\"],
                        correct: 0
                    }
                ]
            },
            sports: {
                easy: [
                    {
                        question: \"How many players are on a basketball team on the court?\",
                        answers: [\"4\", \"5\", \"6\", \"7\"],
                        correct: 1
                    },
                    {
                        question: \"What sport is played at Wimbledon?\",
                        answers: [\"Golf\", \"Tennis\", \"Cricket\", \"Rugby\"],
                        correct: 1
                    },
                    {
                        question: \"How often are the Olympic Games held?\",
                        answers: [\"Every 2 years\", \"Every 3 years\", \"Every 4 years\", \"Every 5 years\"],
                        correct: 2
                    },
                    {
                        question: \"What is the maximum score in ten-pin bowling?\",
                        answers: [\"200\", \"250\", \"300\", \"350\"],
                        correct: 2
                    },
                    {
                        question: \"Which sport uses a puck?\",
                        answers: [\"Soccer\", \"Hockey\", \"Basketball\", \"Tennis\"],
                        correct: 1
                    }
                ],
                medium: [
                    {
                        question: \"Who has won the most Grand Slam tennis titles?\",
                        answers: [\"Roger Federer\", \"Rafael Nadal\", \"Novak Djokovic\", \"Serena Williams\"],
                        correct: 2
                    },
                    {
                        question: \"In which sport would you perform a slam dunk?\",
                        answers: [\"Volleyball\", \"Basketball\", \"Tennis\", \"Badminton\"],
                        correct: 1
                    },
                    {
                        question: \"What is the term for three strikes in a row in bowling?\",
                        answers: [\"Turkey\", \"Spare\", \"Split\", \"Gutter\"],
                        correct: 0
                    },
                    {
                        question: \"Which country has won the most FIFA World Cups?\",
                        answers: [\"Germany\", \"Argentina\", \"Brazil\", \"Italy\"],
                        correct: 2
                    },
                    {
                        question: \"What is the length of a marathon?\",
                        answers: [\"26.2 miles\", \"25 miles\", \"27 miles\", \"24.5 miles\"],
                        correct: 0
                    }
                ],
                hard: [
                    {
                        question: \"Who holds the record for most home runs in a single MLB season?\",
                        answers: [\"Babe Ruth\", \"Hank Aaron\", \"Barry Bonds\", \"Mark McGwire\"],
                        correct: 2
                    },
                    {
                        question: \"What is the Fosbury Flop?\",
                        answers: [\"Swimming technique\", \"High jump technique\", \"Diving technique\", \"Gymnastics move\"],
                        correct: 1
                    },
                    {
                        question: \"Which Formula 1 driver has won the most championships?\",
                        answers: [\"Ayrton Senna\", \"Michael Schumacher\", \"Lewis Hamilton\", \"Sebastian Vettel\"],
                        correct: 1
                    },
                    {
                        question: \"What is the maximum number of clubs a golfer can carry?\",
                        answers: [\"12\", \"14\", \"16\", \"18\"],
                        correct: 1
                    },
                    {
                        question: \"Which boxer was known as 'The Greatest'?\",
                        answers: [\"Joe Frazier\", \"George Foreman\", \"Muhammad Ali\", \"Mike Tyson\"],
                        correct: 2
                    }
                ]
            },
            entertainment: {
                easy: [
                    {
                        question: \"Which movie features the song 'My Heart Will Go On'?\",
                        answers: [\"Titanic\", \"The Bodyguard\", \"Ghost\", \"Dirty Dancing\"],
                        correct: 0
                    },
                    {
                        question: \"Who directed the movie 'Jaws'?\",
                        answers: [\"George Lucas\", \"Steven Spielberg\", \"Martin Scorsese\", \"Francis Ford Coppola\"],
                        correct: 1
                    },
                    {
                        question: \"Which Disney movie features the song 'Let It Go'?\",
                        answers: [\"Moana\", \"Frozen\", \"Tangled\", \"The Little Mermaid\"],
                        correct: 1
                    },
                    {
                        question: \"What is the highest-grossing film of all time?\",
                        answers: [\"Avatar\", \"Titanic\", \"Avengers: Endgame\", \"Star Wars: The Force Awakens\"],
                        correct: 2
                    },
                    {
                        question: \"Which TV show features the character Sherlock Holmes?\",
                        answers: [\"Elementary\", \"Sherlock\", \"Both\", \"Neither\"],
                        correct: 2
                    }
                ],
                medium: [
                    {
                        question: \"Who composed the music for 'The Lion King'?\",
                        answers: [\"Alan Menken\", \"Hans Zimmer\", \"John Williams\", \"Danny Elfman\"],
                        correct: 1
                    },
                    {
                        question: \"Which actor played Iron Man in the Marvel Cinematic Universe?\",
                        answers: [\"Chris Evans\", \"Robert Downey Jr.\", \"Mark Ruffalo\", \"Chris Hemsworth\"],
                        correct: 1
                    },
                    {
                        question: \"What is the name of the coffee shop in the TV show 'Friends'?\",
                        answers: [\"Central Perk\", \"The Grind\", \"Java Joe's\", \"Bean There\"],
                        correct: 0
                    },
                    {
                        question: \"Which film won the first Academy Award for Best Picture?\",
                        answers: [\"Wings\", \"The Jazz Singer\", \"Sunrise\", \"The Circus\"],
                        correct: 0
                    },
                    {
                        question: \"Who wrote the 'Harry Potter' book series?\",
                        answers: [\"J.R.R. Tolkien\", \"J.K. Rowling\", \"C.S. Lewis\", \"Roald Dahl\"],
                        correct: 1
                    }
                ],
                hard: [
                    {
                        question: \"Which director is known for the films 'Vertigo' and 'Psycho'?\",
                        answers: [\"Alfred Hitchcock\", \"Orson Welles\", \"Billy Wilder\", \"John Ford\"],
                        correct: 0
                    },
                    {
                        question: \"What was the first feature-length animated film?\",
                        answers: [\"Fantasia\", \"Snow White and the Seven Dwarfs\", \"Pinocchio\", \"Bambi\"],
                        correct: 1
                    },
                    {
                        question: \"Which composer wrote 'The Four Seasons'?\",
                        answers: [\"Bach\", \"Mozart\", \"Vivaldi\", \"Beethoven\"],
                        correct: 2
                    },
                    {
                        question: \"What is the longest-running Broadway show?\",
                        answers: [\"The Lion King\", \"Chicago\", \"The Phantom of the Opera\", \"Cats\"],
                        correct: 2
                    },
                    {
                        question: \"Which video game franchise features Master Chief?\",
                        answers: [\"Call of Duty\", \"Halo\", \"Destiny\", \"Gears of War\"],
                        correct: 1
                    }
                ]
            },
            technology: {
                easy: [
                    {
                        question: \"What does 'WWW' stand for?\",
                        answers: [\"World Wide Web\", \"World Wide Website\", \"Web World Wide\", \"Website World Wide\"],
                        correct: 0
                    },
                    {
                        question: \"Which company created the iPhone?\",
                        answers: [\"Samsung\", \"Google\", \"Apple\", \"Microsoft\"],
                        correct: 2
                    },
                    {
                        question: \"What does 'CPU' stand for?\",
                        answers: [\"Central Processing Unit\", \"Computer Processing Unit\", \"Central Program Unit\", \"Computer Program Unit\"],
                        correct: 0
                    },
                    {
                        question: \"Which programming language is known for its use in web development?\",
                        answers: [\"Python\", \"JavaScript\", \"C++\", \"Java\"],
                        correct: 1
                    },
                    {
                        question: \"What is the most popular social media platform?\",
                        answers: [\"Twitter\", \"Instagram\", \"Facebook\", \"TikTok\"],
                        correct: 2
                    }
                ],
                medium: [
                    {
                        question: \"Who founded Microsoft?\",
                        answers: [\"Steve Jobs\", \"Bill Gates\", \"Mark Zuckerberg\", \"Larry Page\"],
                        correct: 1
                    },
                    {
                        question: \"What does 'AI' stand for?\",
                        answers: [\"Automated Intelligence\", \"Artificial Intelligence\", \"Advanced Intelligence\", \"Algorithmic Intelligence\"],
                        correct: 1
                    },
                    {
                        question: \"Which protocol is used for secure web browsing?\",
                        answers: [\"HTTP\", \"HTTPS\", \"FTP\", \"SMTP\"],
                        correct: 1
                    },
                    {
                        question: \"What is the most widely used operating system?\",
                        answers: [\"Windows\", \"macOS\", \"Linux\", \"Android\"],
                        correct: 3
                    },
                    {
                        question: \"Which company developed the Android operating system?\",
                        answers: [\"Apple\", \"Microsoft\", \"Google\", \"Samsung\"],
                        correct: 2
                    }
                ],
                hard: [
                    {
                        question: \"What is the difference between RAM and ROM?\",
                        answers: [\"RAM is permanent, ROM is temporary\", \"RAM is temporary, ROM is permanent\", \"No difference\", \"RAM is faster, ROM is slower\"],
                        correct: 1
                    },
                    {
                        question: \"Which algorithm is commonly used for encryption?\",
                        answers: [\"Bubble Sort\", \"RSA\", \"Linear Search\", \"Binary Search\"],
                        correct: 1
                    },
                    {
                        question: \"What is the primary function of a compiler?\",
                        answers: [\"Execute programs\", \"Store data\", \"Translate source code\", \"Manage memory\"],
                        correct: 2
                    },
                    {
                        question: \"Which data structure uses LIFO (Last In, First Out)?\",
                        answers: [\"Queue\", \"Stack\", \"Array\", \"Linked List\"],
                        correct: 1
                    },
                    {
                        question: \"What is the purpose of DNS?\",
                        answers: [\"Data encryption\", \"Domain name resolution\", \"Data storage\", \"Network routing\"],
                        correct: 1
                    }
                ]
            }
        };
    }
    
    loadQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        this.questionText.textContent = question.question;
        this.selectedAnswer = null;
        this.nextBtn.disabled = true;
        
        // Clear previous answers
        this.answersContainer.innerHTML = '';
        
        // Create answer options
        question.answers.forEach((answer, index) => {
            const answerEl = document.createElement('div');
            answerEl.className = 'answer-option';
            answerEl.innerHTML = `<span class=\"answer-text\">${answer}</span>`;
            answerEl.addEventListener('click', () => this.selectAnswer(index));
            this.answersContainer.appendChild(answerEl);
        });
        
        this.updateProgress();
    }
    
    selectAnswer(index) {
        // Remove previous selections
        this.answersContainer.querySelectorAll('.answer-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new answer
        this.selectedAnswer = index;
        this.answersContainer.children[index].classList.add('selected');
        this.nextBtn.disabled = false;
    }
    
    nextQuestion() {
        if (this.selectedAnswer === null) return;
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        
        // Store user answer
        this.userAnswers.push({
            question: question.question,
            userAnswer: this.selectedAnswer,
            correctAnswer: question.correct,
            answers: question.answers,
            isCorrect: isCorrect,
            skipped: false
        });
        
        // Update score
        if (isCorrect) {
            this.score += this.calculateScore();
        }
        
        // Show correct answer
        this.showAnswerFeedback();
        
        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex >= this.questions.length) {
                this.endQuiz();
            } else {
                this.loadQuestion();
            }
        }, 1500);
    }
    
    skipQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Store skipped answer
        this.userAnswers.push({
            question: question.question,
            userAnswer: -1,
            correctAnswer: question.correct,
            answers: question.answers,
            isCorrect: false,
            skipped: true
        });
        
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
        } else {
            this.loadQuestion();
        }
    }
    
    showAnswerFeedback() {
        const question = this.questions[this.currentQuestionIndex];
        const answerOptions = this.answersContainer.querySelectorAll('.answer-option');
        
        answerOptions.forEach((option, index) => {
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer) {
                option.classList.add('incorrect');
            }
            option.style.pointerEvents = 'none';
        });
    }
    
    calculateScore() {
        let baseScore = 10;
        
        // Difficulty multiplier
        const difficultyMultiplier = {
            easy: 1,
            medium: 1.5,
            hard: 2
        };
        
        baseScore *= difficultyMultiplier[this.quizSettings.difficulty];
        
        // Time bonus
        if (this.quizSettings.timeLimit > 0) {
            const timeBonus = Math.max(0, this.timeLeft / this.quizSettings.timeLimit);
            baseScore += Math.round(baseScore * timeBonus * 0.5);
        }
        
        return Math.round(baseScore);
    }
    
    startTimer() {
        this.timeLeft = this.quizSettings.timeLimit;
        this.updateTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.skipQuestion();
            }
        }, 1000);
    }
    
    updateTimer() {
        this.timerEl.textContent = this.timeLeft;
        this.timerEl.classList.toggle('warning', this.timeLeft <= 10);
    }
    
    updateProgress() {
        const progress = (this.currentQuestionIndex / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.scoreEl.textContent = this.score;
    }
    
    endQuiz() {
        clearInterval(this.timer);
        this.showSection('results');
        
        // Calculate results
        const correct = this.userAnswers.filter(a => a.isCorrect).length;
        const incorrect = this.userAnswers.filter(a => !a.isCorrect && !a.skipped).length;
        const skipped = this.userAnswers.filter(a => a.skipped).length;
        const accuracy = this.questions.length > 0 ? Math.round((correct / this.questions.length) * 100) : 0;
        
        // Update UI
        this.finalScore.textContent = this.score;
        this.correctAnswers.textContent = correct;
        this.incorrectAnswers.textContent = incorrect;
        this.skippedAnswers.textContent = skipped;
        this.accuracy.textContent = `${accuracy}%`;
        
        // Show performance badge
        this.showPerformanceBadge(accuracy);
        
        // Update statistics
        this.updateStatistics(correct, this.score);
        
        // Save results
        this.saveResults();
    }
    
    showPerformanceBadge(accuracy) {
        const badge = this.performanceBadge;
        const icon = badge.querySelector('.badge-icon');
        const text = badge.querySelector('.badge-text');
        
        if (accuracy >= 90) {
            icon.textContent = '🏆';
            text.textContent = 'Excellent!';
            badge.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        } else if (accuracy >= 70) {
            icon.textContent = '🥉';
            text.textContent = 'Good Job!';
            badge.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        } else if (accuracy >= 50) {
            icon.textContent = '📚';
            text.textContent = 'Keep Learning!';
            badge.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
        } else {
            icon.textContent = '💪';
            text.textContent = 'Try Again!';
            badge.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
    }
    
    showAnswerReview() {
        this.showSection('review');
        
        this.reviewList.innerHTML = this.userAnswers.map((answer, index) => {
            const userAnswerText = answer.skipped ? 'Skipped' : answer.answers[answer.userAnswer];
            const correctAnswerText = answer.answers[answer.correctAnswer];
            
            return `
                <div class=\"review-item\">
                    <div class=\"review-question\">${index + 1}. ${answer.question}</div>
                    <div class=\"review-answers\">
                        <div class=\"review-answer correct\">✓ Correct: ${correctAnswerText}</div>
                        <div class=\"review-answer ${answer.isCorrect ? 'correct' : (answer.skipped ? 'user-answer' : 'incorrect')}\">
                            ${answer.skipped ? '⏭️' : (answer.isCorrect ? '✓' : '✗')} Your answer: ${userAnswerText}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    backToResults() {
        this.showSection('results');
    }
    
    playAgain() {
        this.showSection('setup');
    }
    
    shareResults() {
        const accuracy = this.userAnswers.length > 0 ? Math.round((this.userAnswers.filter(a => a.isCorrect).length / this.userAnswers.length) * 100) : 0;
        const shareText = `I just scored ${this.score} points with ${accuracy}% accuracy on the Quiz App! 🧠 Category: ${this.quizSettings.category.charAt(0).toUpperCase() + this.quizSettings.category.slice(1)} | Difficulty: ${this.quizSettings.difficulty.charAt(0).toUpperCase() + this.quizSettings.difficulty.slice(1)}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz App Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Results copied to clipboard!');
            });
        }
    }
    
    quitQuiz() {
        if (confirm('Are you sure you want to quit the quiz?')) {
            clearInterval(this.timer);
            this.showSection('setup');
        }
    }
    
    showSection(section) {
        // Hide all sections
        this.quizSetup.classList.remove('active');
        this.quizGame.classList.remove('active');
        this.quizResults.classList.remove('active');
        this.answerReview.classList.remove('active');
        
        // Show selected section
        switch (section) {
            case 'setup':
                this.quizSetup.style.display = 'block';
                break;
            case 'game':
                this.quizGame.classList.add('active');
                this.quizSetup.style.display = 'none';
                break;
            case 'results':
                this.quizResults.classList.add('active');
                break;
            case 'review':
                this.answerReview.classList.add('active');
                break;
        }
    }
    
    updateStatistics(correct, score) {
        this.statistics.totalQuizzes++;
        this.statistics.totalScore += score;
        this.statistics.totalCorrect += correct;
        
        if (score > this.statistics.bestScore) {
            this.statistics.bestScore = score;
        }
        
        // Update category stats
        const category = this.quizSettings.category;
        if (!this.statistics.categoryStats[category]) {
            this.statistics.categoryStats[category] = {
                quizzes: 0,
                correct: 0,
                total: 0
            };
        }
        
        this.statistics.categoryStats[category].quizzes++;
        this.statistics.categoryStats[category].correct += correct;
        this.statistics.categoryStats[category].total += this.questions.length;
        
        this.saveStatistics();
        this.updateStatsUI();
    }
    
    updateStatsUI() {
        const avgScore = this.statistics.totalQuizzes > 0 ? 
            Math.round(this.statistics.totalScore / this.statistics.totalQuizzes) : 0;
        
        this.totalQuizzesEl.textContent = this.statistics.totalQuizzes;
        this.averageScoreEl.textContent = avgScore;
        this.bestScoreEl.textContent = this.statistics.bestScore;
        this.totalCorrectEl.textContent = this.statistics.totalCorrect;
        
        // Update category chart
        this.updateCategoryChart();
        
        // Update recent scores
        this.updateRecentScores();
    }
    
    updateCategoryChart() {
        const categories = Object.keys(this.statistics.categoryStats);
        
        this.categoryChart.innerHTML = categories.map(category => {
            const stats = this.statistics.categoryStats[category];
            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            
            return `
                <div class=\"category-bar\">
                    <div class=\"category-name\">${category}</div>
                    <div class=\"category-progress\">
                        <div class=\"category-progress-fill\" style=\"width: ${percentage}%\"></div>
                    </div>
                    <div class=\"category-percentage\">${percentage}%</div>
                </div>
            `;
        }).join('');
    }
    
    updateRecentScores() {
        const recentScores = this.getRecentScores();
        
        this.recentScores.innerHTML = recentScores.map(score => `
            <div class=\"score-item\">
                <div class=\"score-info\">${score.category} - ${score.difficulty}</div>
                <div class=\"score-value\">${score.score}</div>
            </div>
        `).join('');
    }
    
    getRecentScores() {
        try {
            const saved = localStorage.getItem('quizRecentScores');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }
    
    saveResults() {
        const recentScores = this.getRecentScores();
        const newScore = {
            score: this.score,
            category: this.quizSettings.category,
            difficulty: this.quizSettings.difficulty,
            date: new Date().toISOString()
        };
        
        recentScores.unshift(newScore);
        
        // Keep only last 10 scores
        if (recentScores.length > 10) {
            recentScores.splice(10);
        }
        
        localStorage.setItem('quizRecentScores', JSON.stringify(recentScores));
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('quizTheme', newTheme);
    }
    
    toggleStats() {
        this.sidePanel.classList.toggle('active');
    }
    
    handleKeyPress(event) {
        if (this.quizGame.classList.contains('active')) {
            if (event.key >= '1' && event.key <= '4') {
                const index = parseInt(event.key) - 1;
                if (index < this.answersContainer.children.length) {
                    this.selectAnswer(index);
                }
            } else if (event.key === 'Enter' && !this.nextBtn.disabled) {
                this.nextQuestion();
            } else if (event.key === ' ') {
                event.preventDefault();
                this.skipQuestion();
            }
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveSettings() {
        localStorage.setItem('quizSettings', JSON.stringify(this.quizSettings));
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('quizSettings');
            if (saved) {
                this.quizSettings = { ...this.quizSettings, ...JSON.parse(saved) };
                this.categorySelect.value = this.quizSettings.category;
                this.difficultySelect.value = this.quizSettings.difficulty;
                this.questionCountSelect.value = this.quizSettings.questionCount;
                this.timeLimitSelect.value = this.quizSettings.timeLimit;
            }
            
            const theme = localStorage.getItem('quizTheme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
            this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    saveStatistics() {
        localStorage.setItem('quizStatistics', JSON.stringify(this.statistics));
    }
    
    loadStatistics() {
        try {
            const saved = localStorage.getItem('quizStatistics');
            if (saved) {
                this.statistics = { ...this.statistics, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    updateUI() {
        this.updateStatsUI();
        this.showSection('setup');
    }
}

// Initialize quiz app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});