particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#00ff88' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#00b7ff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 3, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) - hash) + password.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString();
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const username = form.querySelector('input[name="username"]');
    const email = form.querySelector('input[name="email"]');
    const password = form.querySelector('input[name="password"]');

    if (username && username.value.length < 3) {
        showMessage(formId, "Username must be at least 3 characters long.", "error");
        username.style.background = 'rgba(255, 0, 0, 0.2)';
        return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showMessage(formId, "Please enter a valid email address.", "error");
        email.style.background = 'rgba(255, 0, 0, 0.2)';
        return false;
    }

    if (password && password.value.length < 6) {
        showMessage(formId, "Password must be at least 6 characters long.", "error");
        password.style.background = 'rgba(255, 0, 0, 0.2)';
        return false;
    }

    return true;
}

function showMessage(formId, message, type) {
    const form = document.getElementById(formId);
    let messageDiv = form.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        form.prepend(messageDiv);
    }
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
}

function registerUser(event) {
    event.preventDefault();
    if (!validateForm('registerForm')) return;

    const form = document.getElementById('registerForm');
    const username = form.querySelector('input[name="username"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const password = hashPassword(form.querySelector('input[name="password"]').value);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        showMessage('registerForm', 'Email already registered.', 'error');
        return;
    }

    users.push({ username, email, password, score: 0 });
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('registerForm', 'Registration successful! Please login.', 'success');
    setTimeout(() => window.location.href = 'login.html', 2000);
}

function loginUser(event) {
    event.preventDefault();
    if (!validateForm('loginForm')) return;

    const form = document.getElementById('loginForm');
    const email = form.querySelector('input[name="email"]').value;
    const password = hashPassword(form.querySelector('input[name="password"]').value);

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMessage('loginForm', 'Login successful!', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        showMessage('loginForm', 'Invalid email or password.', 'error');
    }
}

function loadDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    const welcomeMessage = document.querySelector('h1');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
    }

    const progressDiv = document.getElementById('homeworkProgress');
    const submissions = JSON.parse(localStorage.getItem('homeworkSubmissions')) || [];
    const userSubmissions = submissions.filter(s => s.user === currentUser.email);
    progressDiv.innerHTML = `<p>You have completed ${userSubmissions.length} homework submissions.</p>`;

    const rankingDiv = document.getElementById('worldRanking');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const rankedUsers = users.sort((a, b) => b.score - a.score).slice(0, 5);
    let rankingHtml = '<h3>World Ranking</h3><table><tr><th>Rank</th><th>User</th><th>Score</th></tr>';
    rankedUsers.forEach((user, index) => {
        rankingHtml += `<tr><td>${index + 1}</td><td>${user.username}</td><td>${user.score}</td></tr>`;
    });
    rankingHtml += '</table>';
    rankingDiv.innerHTML = rankingHtml;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function validateAILessonForm(formId) {
    const form = document.getElementById(formId);
    const question = form.querySelector('input[name="question"]');
    if (!question.value || question.value.length < 5) {
        showMessage(formId, 'Question must be at least 5 characters long.', 'error');
        question.style.background = 'rgba(255, 0, 0, 0.2)';
        return false;
    }
    const language = form.querySelector('select[name="language"]').value;
    if (!language) {
        showMessage(formId, 'Please select a language/framework.', 'error');
        return false;
    }
    return true;
}

async function submitAILesson(event) {
    event.preventDefault();
    if (!validateAILessonForm('aiLessonForm')) return;

    const form = document.getElementById('aiLessonForm');
    const question = form.querySelector('input[name="question"]').value;
    const language = form.querySelector('select[name="language"]').value;
    const responseDiv = document.getElementById('aiResponse');
    const loader = document.getElementById('loader');

    // Show loader
    loader.style.display = 'block';
    responseDiv.innerHTML = '';

    // Sanitize input to prevent XSS
    const sanitizedQuestion = question.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Google Gemini API key (replace with your key)
    const apiKey = 'AIzaSyAoTHRQ0jt0IB9CBIc4AmSnYJqJdCgf_no';
    const prompt = `You are an expert programming tutor. Provide a detailed, educational response to the following question about ${language}: "${sanitizedQuestion}". Include code examples where applicable, and format the response in markdown.`;

    // Retry logic for rate limits
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000; // Initial delay in ms

    while (attempt < maxRetries) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7
                    }
                })
            });

            if (response.status === 429) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Gemini API key.');
                } else {
                    throw new Error(`API error: ${response.statusText}`);
                }
            }

            const data = await response.json();
            const answer = data.candidates[0].content.parts[0].text;

            // Render markdown using marked.js, fallback to plain text if marked is not defined
            const renderedAnswer = typeof marked !== 'undefined' && marked.parse ? marked.parse(answer) : answer.replace(/\n/g, '<br>');

            responseDiv.innerHTML = `
                <h3>Your AI-Generated Lesson</h3>
                ${renderedAnswer}
            `;
            showMessage('aiLessonForm', 'Lesson generated successfully!', 'success');
            break;

        } catch (error) {
            console.error('Error:', error);
            if (attempt >= maxRetries - 1) {
                showMessage('aiLessonForm', error.message || 'Failed to fetch response. Please try again.', 'error');
            }
        } finally {
            loader.style.display = 'none';
        }
        attempt++;
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

const lessonsData = {
    html: {
        text: `
            <h3>HTML Basics</h3>
            <p>1. <b>Introduction</b>: HTML (HyperText Markup Language) structures web content.</p>
            <p>2. <b>Tags</b>: Use tags like <h1> for headings and <p> for paragraphs.</p>
            <p>3. <b>Attributes</b>: Add attributes like id or class to elements.</p>
            <p>4. <b>Links</b>: Use <a href="..."> for hyperlinks.</p>
            <p>5. <b>Images</b>: Embed images with <img src="..." alt="...">.</p>
        `,
        video: [
            { title: "HTML Crash Course", url: "https://www.youtube.com/embed/pQN-pnXPaVg" },
            { title: "HTML for Beginners", url: "https://www.youtube.com/embed/UB1O30fR-EE" },
            { title: "HTML Tutorial", url: "https://www.youtube.com/embed/9gTw2EDkaDQ" }
        ],
        quizzes: [
            { question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperTool Multi Language", "HomeTool Markup Language"], answer: "HyperText Markup Language" },
            { question: "Which tag is used for a paragraph?", options: ["<div>", "<p>", "<span>", "<section>"], answer: "<p>" },
            { question: "What is the correct HTML for a hyperlink?", options: ["<a href='url'>link</a>", "<link href='url'>link</link>", "<a src='url'>link</a>", "<href='url'>link</href>"], answer: "<a href='url'>link</a>" },
            { question: "Which tag inserts a line break?", options: ["<br>", "<hr>", "<break>", "<lb>"], answer: "<br>" },
            { question: "What is the correct HTML for an image?", options: ["<img src='url' alt='text'>", "<image src='url'>", "<img href='url'>", "<pic src='url'>"], answer: "<img src='url' alt='text'>" }
        ]
    },
    css: {
        text: `
            <h3>CSS Basics</h3>
            <p>1. <b>Introduction</b>: CSS styles web pages.</p>
            <p>2. <b>Selectors</b>: Target elements with classes or IDs.</p>
            <p>3. <b>Box Model</b>: Includes margin, border, padding, content.</p>
            <p>4. <b>Flexbox</b>: Align items with display: flex.</p>
            <p>5. <b>Media Queries</b>: Make designs responsive.</p>
        `,
        video: [
            { title: "CSS Crash Course", url: "https://www.youtube.com/embed/yfoY53QXEnI" },
            { title: "CSS Tutorial for Beginners", url: "https://www.youtube.com/embed/1Rs2ND1ryYc" },
            { title: "Learn CSS in 20 Minutes", url: "https://www.youtube.com/embed/0afZj1G0BIE" }
        ],
        quizzes: [
            { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets", "Computer Style Sheets"], answer: "Cascading Style Sheets" },
            { question: "How do you select an element with id 'myId'?", options: ["#myId", ".myId", "myId", "*myId"], answer: "#myId" },
            { question: "What property sets text color?", options: ["color", "font-color", "text-color", "shade"], answer: "color" },
            { question: "What is the default value of position?", options: ["static", "relative", "absolute", "fixed"], answer: "static" },
            { question: "How do you make a flex container?", options: ["display: flex", "flex: true", "display: block", "flex-container: true"], answer: "display: flex" }
        ]
    },
    javascript: {
        text: `
            <h3>JavaScript Basics</h3>
            <p>1. <b>Introduction</b>: JavaScript adds interactivity to web pages.</p>
            <p>2. <b>Variables</b>: Declare with var, let, or const.</p>
            <p>3. <b>Functions</b>: Define reusable code blocks.</p>
            <p>4. <b>Events</b>: Handle user interactions like clicks.</p>
            <p>5. <b>DOM</b>: Manipulate HTML elements dynamically.</p>
        `,
        video: [
            { title: "JavaScript Tutorial", url: "https://www.youtube.com/embed/W6NZfCO5SIk" },
            { title: "JavaScript for Beginners", url: "https://www.youtube.com/embed/PkZNo7MFNFg" },
            { title: "Learn JavaScript in 1 Hour", url: "https://www.youtube.com/embed/2qDywOS7VAc" }
        ],
        quizzes: [
            { question: "Which keyword declares a constant?", options: ["const", "let", "var", "static"], answer: "const" },
            { question: "How do you write a function?", options: ["function myFunc() {}", "myFunc() {}", "def myFunc():", "func myFunc()"], answer: "function myFunc() {}" },
            { question: "What is the DOM?", options: ["Document Object Model", "Data Object Model", "Dynamic Object Mode", "Document Order Model"], answer: "Document Object Model" },
            { question: "How do you add an event listener?", options: ["addEventListener", "onEvent", "eventListener", "attachEvent"], answer: "addEventListener" },
            { question: "What is 'undefined'?", options: ["A variable with no value", "A syntax error", "A null value", "A function"], answer: "A variable with no value" }
        ]
    },
    sql: {
        text: `
            <h3>SQL Basics</h3>
            <p>1. <b>Introduction</b>: SQL manages databases.</p>
            <p>2. <b>SELECT</b>: Retrieve data from tables.</p>
            <p>3. <b>INSERT</b>: Add new records.</p>
            <p>4. <b>UPDATE</b>: Modify existing records.</p>
            <p>5. <b>JOIN</b>: Combine data from multiple tables.</p>
        `,
        video: [
            { title: "SQL Tutorial for Beginners", url: "https://www.youtube.com/embed/HXV3zeQKqGY" },
            { title: "Learn SQL in 1 Hour", url: "https://www.youtube.com/embed/9Pzj7Aj25lw" },
            { title: "SQL Crash Course", url: "https://www.youtube.com/embed/7S_tz1z_5bA" }
        ],
        quizzes: [
            { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "Standard Query Language"], answer: "Structured Query Language" },
            { question: "Which command retrieves data?", options: ["SELECT", "GET", "FETCH", "RETRIEVE"], answer: "SELECT" },
            { question: "How do you add a record?", options: ["INSERT", "ADD", "CREATE", "PUT"], answer: "INSERT" },
            { question: "Which clause filters records?", options: ["WHERE", "FILTER", "SELECT", "HAVING"], answer: "WHERE" },
            { question: "What joins two tables?", options: ["JOIN", "MERGE", "COMBINE", "UNION"], answer: "JOIN" }
        ]
    },
    python: {
        text: `
            <h3>Python Basics</h3>
            <p>1. <b>Introduction</b>: Python is a versatile programming language.</p>
            <p>2. <b>Variables</b>: No type declaration needed.</p>
            <p>3. <b>Lists</b>: Store multiple items in a single variable.</p>
            <p>4. <b>Functions</b>: Define with def keyword.</p>
            <p>5. <b>Modules</b>: Import libraries like math or numpy.</p>
        `,
        video: [
            { title: "Python for Beginners", url: "https://www.youtube.com/embed/kWiCuklohdY" },
            { title: "Python Tutorial", url: "https://www.youtube.com/embed/_uQrJ0TkZlc" },
            { title: "Learn Python in 1 Hour", url: "https://www.youtube.com/embed/kLZuut1fYzQ" }
        ],
        quizzes: [
            { question: "Which keyword defines a function?", options: ["def", "function", "func", "define"], answer: "def" },
            { question: "How do you create a list?", options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "<1, 2, 3>"], answer: "[1, 2, 3]" },
            { question: "What is Python's print function?", options: ["Outputs to console", "Saves to file", "Creates a variable", "Defines a loop"], answer: "Outputs to console" },
            { question: "How do you import a module?", options: ["import module", "include module", "require module", "use module"], answer: "import module" },
            { question: "What is None in Python?", options: ["Null value", "Zero", "Empty string", "False"], answer: "Null value" }
        ]
    },
    java: {
        text: `
            <h3>Java Basics</h3>
            <p>1. <b>Introduction</b>: Java is platform-independent.</p>
            <p>2. <b>Classes</b>: Define objects with classes.</p>
            <p>3. <b>Methods</b>: Functions inside classes.</p>
            <p>4. <b>Loops</b>: Use for, while for iteration.</p>
            <p>5. <b>Inheritance</b>: Extend classes for reuse.</p>
        `,
        video: [
            { title: "Java Tutorial for Beginners", url: "https://www.youtube.com/embed/eIrMbAQSU34" },
            { title: "Learn Java in 1 Hour", url: "https://www.youtube.com/embed/WCfNniklSNA" },
            { title: "Java Crash Course", url: "https://www.youtube.com/embed/8cm1x4bC610" }
        ],
        quizzes: [
            { question: "What is Java's main method?", options: ["public static void main(String[] args)", "void main()", "static main()", "public void main()"], answer: "public static void main(String[] args)" },
            { question: "How do you declare a class?", options: ["class MyClass {}", "MyClass {}", "define MyClass {}", "struct MyClass {}"], answer: "class MyClass {}" },
            { question: "What keyword creates an object?", options: ["new", "create", "object", "instance"], answer: "new" },
            { question: "Which loop is entry-controlled?", options: ["for", "do-while", "while", "foreach"], answer: "for" },
            { question: "What is inheritance?", options: ["Extending a class", "Creating a variable", "Defining a method", "Looping"], answer: "Extending a class" }
        ]
    },
    php: {
        text: `
            <h3>PHP Basics</h3>
            <p>1. <b>Introduction</b>: PHP is for server-side scripting.</p>
            <p>2. <b>Variables</b>: Start with $.</p>
            <p>3. <b>Arrays</b>: Store multiple values.</p>
            <p>4. <b>Functions</b>: Define with function keyword.</p>
            <p>5. <b>Forms</b>: Handle user input with $_POST.</p>
        `,
        video: [
            { title: "PHP Tutorial for Beginners", url: "https://www.youtube.com/embed/OK_JCtrrv-c" },
            { title: "Learn PHP in 1 Hour", url: "https://www.youtube.com/embed/s1Nq8l6f0wA" },
            { title: "PHP Crash Course", url: "https://www.youtube.com/embed/2eebptXfEvw" }
        ],
        quizzes: [
            { question: "What does PHP stand for?", options: ["Hypertext Preprocessor", "Personal Home Page", "Pretext Hyper Processor", "Page Hypertext Protocol"], answer: "Hypertext Preprocessor" },
            { question: "How do you declare a variable?", options: ["$var", "var $var", "let $var", "const $var"], answer: "$var" },
            { question: "How do you create an array?", options: ["array()", "[]", "{}", "()"], answer: "array()" },
            { question: "What handles form data?", options: ["$_POST", "$_FORM", "$_DATA", "$_INPUT"], answer: "$_POST" },
            { question: "Which keyword defines a function?", options: ["function", "def", "func", "method"], answer: "function" }
        ]
    },
    c: {
        text: `
            <h3>C Basics</h3>
            <p>1. <b>Introduction</b>: C is a general-purpose language.</p>
            <p>2. <b>Variables</b>: Declare with types like int, float.</p>
            <p>3. <b>Pointers</b>: Store memory addresses.</p>
            <p>4. <b>Functions</b>: Define reusable code.</p>
            <p>5. <b>Arrays</b>: Store multiple values of same type.</p>
        `,
        video: [
            { title: "C Programming Tutorial", url: "https://www.youtube.com/embed/2NWeucMKrLI" },
            { title: "Learn C in 1 Hour", url: "https://www.youtube.com/embed/KJgsSFOSQv0" },
            { title: "C Crash Course", url: "https://www.youtube.com/embed/87SH2Cn0s9A" }
        ],
        quizzes: [
            { question: "What is a pointer in C?", options: ["Memory address", "Variable", "Function", "Array"], answer: "Memory address" },
            { question: "How do you declare an integer?", options: ["int x;", "integer x;", "num x;", "var x;"], answer: "int x;" },
            { question: "What is printf?", options: ["Output function", "Input function", "Loop function", "Variable"], answer: "Output function" },
            { question: "How do you define a function?", options: ["returnType name() {}", "function name() {}", "def name():", "func name()"], answer: "returnType name() {}" },
            { question: "What is an array?", options: ["Collection of same type", "Single variable", "Function", "Pointer"], answer: "Collection of same type" }
        ]
    },
    cpp: {
        text: `
            <h3>C++ Basics</h3>
            <p>1. <b>Introduction</b>: C++ extends C with OOP.</p>
            <p>2. <b>Classes</b>: Define objects.</p>
            <p>3. <b>Objects</b>: Instances of classes.</p>
            <p>4. <b>Inheritance</b>: Reuse code with parent-child classes.</p>
            <p>5. <b>STL</b>: Use Standard Template Library.</p>
        `,
        video: [
            { title: "C++ Tutorial for Beginners", url: "https://www.youtube.com/embed/vLnPwxZdW4Y" },
            { title: "Learn C++ in 1 Hour", url: "https://www.youtube.com/embed/8jLOx1hD3_o" },
            { title: "C++ Crash Course", url: "https://www.youtube.com/embed/Rub-JsjMhWY" }
        ],
        quizzes: [
            { question: "What is C++ known for?", options: ["Object-Oriented Programming", "Scripting", "Web development", "Database"], answer: "Object-Oriented Programming" },
            { question: "How do you declare a class?", options: ["class MyClass {}", "struct MyClass {}", "object MyClass {}", "type MyClass {}"], answer: "class MyClass {}" },
            { question: "What is cout?", options: ["Output stream", "Input stream", "Variable", "Function"], answer: "Output stream" },
            { question: "What keyword creates an object?", options: ["new", "create", "object", "instance"], answer: "new" },
            { question: "What is STL?", options: ["Standard Template Library", "Simple Type Library", "System Template Library", "Standard Type Library"], answer: "Standard Template Library" }
        ]
    },
    bootstrap: {
        text: `
            <h3>Bootstrap Basics</h3>
            <p>1. <b>Introduction</b>: Bootstrap is a CSS framework.</p>
            <p>2. <b>Grid System</b>: Create responsive layouts.</p>
            <p>3. <b>Components</b>: Use buttons, navbars, etc.</p>
            <p>4. <b>Utilities</b>: Apply spacing, colors easily.</p>
            <p>5. <b>Forms</b>: Style forms with classes.</p>
        `,
        video: [
            { title: "Bootstrap Tutorial", url: "https://www.youtube.com/embed/-qfEOE4vtxE" },
            { title: "Learn Bootstrap in 30 Minutes", url: "https://www.youtube.com/embed/Jz3L2e2q3DE" },
            { title: "Bootstrap Crash Course", url: "https://www.youtube.com/embed/4sosXZsEx4E" }
        ],
        quizzes: [
            { question: "What is Bootstrap?", options: ["CSS Framework", "JavaScript Library", "Database", "Programming Language"], answer: "CSS Framework" },
            { question: "What class creates a responsive grid?", options: ["container", "row", "col", "grid"], answer: "row" },
            { question: "Which class styles a button?", options: ["btn", "button", "btn-style", "click"], answer: "btn" },
            { question: "What is a Bootstrap utility?", options: ["Spacing classes", "JavaScript plugin", "Database query", "Loop"], answer: "Spacing classes" },
            { question: "How do you include Bootstrap?", options: ["CDN link", "Python import", "Java class", "SQL query"], answer: "CDN link" }
        ]
    },
    react: {
        text: `
            <h3>React Basics</h3>
            <p>1. <b>Introduction</b>: React is a JavaScript library for UI.</p>
            <p>2. <b>Components</b>: Build reusable UI pieces.</p>
            <p>3. <b>JSX</b>: Write HTML-like syntax in JavaScript.</p>
            <p>4. <b>State</b>: Manage component data.</p>
            <p>5. <b>Props</b>: Pass data to components.</p>
        `,
        video: [
            { title: "React Tutorial for Beginners", url: "https://www.youtube.com/embed/Ke90Tje7VS0" },
            { title: "Learn React in 1 Hour", url: "https://www.youtube.com/embed/DLX62G4lc44" },
            { title: "React Crash Course", url: "https://www.youtube.com/embed/A71aqufiNtQ" }
        ],
        quizzes: [
            { question: "What is React?", options: ["JavaScript Library", "CSS Framework", "Database", "Backend Framework"], answer: "JavaScript Library" },
            { question: "What is JSX?", options: ["HTML-like syntax", "CSS selector", "JavaScript loop", "Database query"], answer: "HTML-like syntax" },
            { question: "What manages component data?", options: ["State", "Props", "Events", "Hooks"], answer: "State" },
            { question: "How do you pass data to a component?", options: ["Props", "State", "Variables", "Functions"], answer: "Props" },
            { question: "What is a component?", options: ["Reusable UI piece", "Database table", "CSS class", "Loop"], answer: "Reusable UI piece" }
        ]
    },
    django: {
        text: `
            <h3>Django Basics</h3>
            <p>1. <b>Introduction</b>: Django is a Python web framework.</p>
            <p>2. <b>Models</b>: Define database structure.</p>
            <p>3. <b>Views</b>: Handle HTTP requests.</p>
            <p>4. <b>Templates</b>: Render HTML dynamically.</p>
            <p>5. <b>URLs</b>: Map routes to views.</p>
        `,
        video: [
            { title: "Django Tutorial for Beginners", url: "https://www.youtube.com/embed/rHux0gMZ3Eg" },
            { title: "Learn Django in 1 Hour", url: "https://www.youtube.com/embed/OTmQOjsl0eg" },
            { title: "Django Crash Course", url: "https://www.youtube.com/embed/D6esTDrHPzU" }
        ],
        quizzes: [
            { question: "What is Django?", options: ["Python Web Framework", "JavaScript Library", "CSS Framework", "Database"], answer: "Python Web Framework" },
            { question: "What defines database structure?", options: ["Models", "Views", "Templates", "URLs"], answer: "Models" },
            { question: "What handles HTTP requests?", options: ["Views", "Models", "Templates", "Forms"], answer: "Views" },
            { question: "What renders HTML?", options: ["Templates", "Views", "Models", "URLs"], answer: "Templates" },
            { question: "How do you map routes?", options: ["URLs", "Views", "Models", "Templates"], answer: "URLs" }
        ]
    }
};