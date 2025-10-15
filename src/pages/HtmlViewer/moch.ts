const htmlMoch = `

<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>analysis info - Comprehensive Health Analysis Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'inter': ['Inter', 'sans-serif'],
                    },
                    colors: {
                        'neon-green': '#059669',
                        'neon-blue': '#2563eb',
                        'neon-purple': '#7c3aed',
                        'neon-pink': '#db2777',
                        'neon-yellow': '#d97706',
                        'neon-orange': '#ea580c',
                        'light-bg': '#f1f5f9',
                        'card-bg': '#ffffff',
                        'glass-bg': 'rgba(255, 255, 255, 0.85)',
                    },
                    animation: {
                        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
                        'progress-fill': 'progress-fill 1.5s ease-out',
                        'float': 'float 3s ease-in-out infinite',
                    },
                    keyframes: {
                        'pulse-glow': {
                            '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
                            '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
                        },
                        'progress-fill': {
                            '0%': { width: '0%' },
                            '100%': { width: 'var(--progress-width)' },
                        },
                        'float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                        },
                    },
                }
            }
        }
    </script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #0f172a;
        }
        
        /* Balanced text alignment for professional appearance */
        p, .text-gray-700, .leading-relaxed {
            text-align: justify;
            text-justify: inter-word;
            hyphens: auto;
            overflow-wrap: break-word;
            word-break: normal;
            word-spacing: -0.01em;  /* Slight negative adjustment for more natural spacing */
            letter-spacing: 0.008em;
            max-width: 100%;
        }
        
        /* Left alignment for specific elements that need it */
        .text-left {
            text-align: left !important;
            word-spacing: normal;
            letter-spacing: normal;
        }
        
        /* Ensure biomarker card descriptions are properly formatted */
        .biomarker-card p, .biomarker-info {
            text-align: justify;
            text-justify: inter-word;
            hyphens: auto;
            font-size: 0.85em;
            line-height: 1.5;
            margin-top: 0.5rem;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            text-align: justify;
            text-justify: inter-word;
            hyphens: auto;
            font-size: 0.85em;
            line-height: 1.5;
            margin-top: 0.5rem;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
        }
        
        /* Biomarker value styling */
        .biomarker-card .text-center {
            text-align: center !important;
        }
        
        /* Better paragraph spacing */
        p + p {
            margin-top: 0.75rem;
        }
        
        /* Fix for narrow columns with justified text */
        .neumorphic p, .neumorphic-inset p {
            max-width: 100%;
            word-break: break-word;
        }
        
        /* Special handling for cards with limited content */
        .card-highlight-green p:not(.biomarker-section p), 
        .card-highlight-blue p:not(.biomarker-section p), 
        .card-highlight-yellow p:not(.biomarker-section p), 
        .card-highlight-pink p:not(.biomarker-section p) {
            text-align: left; /* Use left alignment for cards to avoid spacing issues */
            hyphens: auto;
            word-break: break-word;
        }
        
        /* Ensure biomarker section descriptions are properly formatted */
        .biomarker-section p, .biomarker-section div p, .biomarker-solution p {
            text-align: justify !important;
            text-justify: inter-word !important;
            hyphens: auto;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
        }
        
        /* Ensure biomarker sections have consistent heights */
        .biomarker-section-container {
            display: flex;
            flex-direction: column;
        }
        
        /* Make all biomarker grids equal height */
        .biomarker-section-container .grid {
            flex-grow: 1;
            align-items: stretch;
        }
        
        /* Ensure all grid layouts have consistent alignment */
        .grid {
            display: grid !important;
            align-items: stretch !important;
        }
        
        /* Ensure all cards in grids have equal height */
        .grid > * {
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
        }
        
        /* Ensure consistent spacing for all sections */
        section {
            margin-bottom: 2rem !important;
        }
        
        /* Fix header alignment on mobile */
        @media (max-width: 768px) {
            .flex-wrap {
                flex-direction: column !important;
                align-items: center !important;
                gap: 1rem !important;
            }
        }
        
        /* Ensure solutions roadmap content is properly formatted */
        .solutions-roadmap-content {
            text-align: justify !important;
            text-justify: inter-word !important;
            hyphens: auto;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
        }
        
        /* Final message text formatting */
        .final-message {
            text-align: justify !important;
            text-justify: inter-word !important;
            margin: 0;
            padding: 0;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
        }
        
        /* Center text for the summary cards at the top of the report */
        .summary-card p, .neumorphic.text-center p {
            text-align: center !important;
        }
        
        /* Ensure health matrix content is properly formatted */
        .health-matrix-content p, .health-matrix-content div, .health-matrix-content li {
            text-align: justify !important;
            text-justify: inter-word !important;
            hyphens: auto;
            word-spacing: -0.01em;
            letter-spacing: 0.008em;
        }
        
        .neumorphic {
            background: #ffffff;
            box-shadow: 
                8px 8px 20px rgba(100, 116, 139, 0.15),
                -8px -8px 20px rgba(255, 255, 255, 1);
            border-radius: 20px;
            border: 1px solid rgba(226, 232, 240, 0.5);
            opacity: 1 !important;
            transform: none !important;
        }
        
        .neumorphic-inset {
            background: #f8fafc;
            box-shadow: 
                inset 4px 4px 12px rgba(100, 116, 139, 0.1),
                inset -4px -4px 12px rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            border: 1px solid rgba(203, 213, 225, 0.3);
            opacity: 1 !important;
            transform: none !important;
        }
        
        .glassmorphic {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(203, 213, 225, 0.4);
            border-radius: 20px;
            box-shadow: 
                0 8px 32px rgba(100, 116, 139, 0.1),
                0 1px 3px rgba(100, 116, 139, 0.05);
            opacity: 1 !important;
            transform: none !important;
        }
        
        .neon-glow {
            filter: drop-shadow(0 0 5px currentColor);
        }
        
        .biomarker-card {
            display: flex;
            flex-direction: column;
            height: 100%;
            transition: all 0.3s ease;
            opacity: 1 !important;
            transform: none !important;
            padding: 0.75rem !important;
            min-height: 8rem;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            height: 100%;
            transition: all 0.3s ease;
            opacity: 1 !important;
            transform: none !important;
            padding: 0.75rem !important;
            min-height: 6rem;
        }
        
        .biomarker-card:hover {
            transform: translateY(-5px) !important;
            transition: all 0.3s ease;
        }
        
        /* Equal height biomarker cards */
        .grid > .biomarker-card {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .intervention-card {
            transition: all 0.3s ease;
            opacity: 1 !important;
            transform: none !important;
        }
        
        .intervention-card:hover {
            transform: scale(1.02) !important;
            box-shadow: 
                12px 12px 30px rgba(100, 116, 139, 0.2),
                -12px -12px 30px rgba(255, 255, 255, 1);
        }
        
        .stat-number {
            background: linear-gradient(45deg, #059669, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }
        
        .level-badge {
            background: linear-gradient(45deg, #7c3aed, #db2777);
            animation: pulse-glow 2s ease-in-out infinite alternate;
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }
        
        .card-highlight-green {
            border-left: 4px solid #10b981;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-yellow {
            border-left: 4px solid #f59e0b;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-pink {
            border-left: 4px solid #ec4899;
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-blue {
            border-left: 4px solid #3b82f6;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-purple {
            border-left: 4px solid #8b5cf6;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-orange {
            border-left: 4px solid #f97316;
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-red {
            border-left: 4px solid #ef4444;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .card-highlight-cyan {
            border-left: 4px solid #06b6d4;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 1) 100%);
        }
        
        .progress-bar-bg {
            background: #e2e8f0;
            border-radius: 10px;
        }
        
        /* Enhanced Mobile responsive styles */
        @media (max-width: 768px) {
            * {
                margin-bottom: 0.5rem !important;
                margin-top: 0 !important;
            }
            
            .container {
                padding: 0.5rem !important;
                max-width: 100% !important;
            }
            
            .glassmorphic {
                margin: 0.25rem !important;
                padding: 0.75rem !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            .neumorphic {
                margin: 0.25rem !important;
                padding: 0.5rem !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                margin-bottom: 0.5rem !important;
                margin-top: 0 !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            
            h2 {
                font-size: 1.25rem !important;
                line-height: 1.3 !important;
            }
            
            h3 {
                font-size: 1.125rem !important;
                line-height: 1.3 !important;
            }
            
            /* Grid layout for biomarker cards on mobile */
            .grid {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                grid-auto-rows: 1fr !important;
                gap: 0.5rem !important;
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 0.5rem !important;
            }
            
            .grid > * {
                margin-bottom: 0.5rem !important;
            }
            
            /* Improve text readability on mobile */
            p, span, div {
                font-size: 0.9rem !important;
                line-height: 1.5 !important;
                word-wrap: break-word !important;
                text-align: justify !important;
                text-justify: inter-word !important;
                hyphens: auto !important;
                word-spacing: -0.01em !important;
                letter-spacing: 0.008em !important;
            }
            
            /* Prevent excessive spacing in narrow columns on mobile */
            .neumorphic-inset p, .card-highlight-green p:not(.summary-card p):not(.biomarker-info), 
            .card-highlight-blue p:not(.summary-card p):not(.biomarker-info), 
            .card-highlight-yellow p:not(.summary-card p):not(.biomarker-info), 
            .card-highlight-pink p:not(.summary-card p):not(.biomarker-info) {
                text-align: justify !important;
                text-justify: inter-word !important;
                hyphens: auto !important;
                word-spacing: -0.01em !important;
                letter-spacing: 0.008em !important;
            }
            
            /* Maintain justified text for biomarker info on mobile */
            .biomarker-info {
                text-align: justify !important;
                text-justify: inter-word !important;
                hyphens: auto !important;
                margin-top: 0.5rem !important;
                word-spacing: -0.01em !important;
                letter-spacing: 0.008em !important;
            }
            
            /* Keep biomarker headings and values centered on mobile */
            .biomarker-card {
                min-height: 7rem !important;
                height: 100% !important;
            }
            
            .biomarker-card h4, .biomarker-card .text-center {
                text-align: center !important;
            }
            
            /* Keep summary cards centered on mobile */
            .summary-card p {
                text-align: center !important;
            }
            
            /* Keep health matrix content properly formatted on mobile */
            .health-matrix-content p, .health-matrix-content div, .health-matrix-content li, .final-message,
            .biomarker-section p, .biomarker-section div p, .biomarker-solution p {
                text-align: justify !important;
                text-justify: inter-word !important;
                word-spacing: -0.01em !important;
                letter-spacing: 0.008em !important;
            }
            
            /* Make intervention cards stack properly */
            .intervention-card {
                width: 100% !important;
                margin-bottom: 1rem !important;
                display: block !important;
            }
            
            /* Ensure intervention protocols section is visible */
            .intervention-protocols {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Force intervention protocols to show on mobile */
            section[class*="intervention"] {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Ensure all intervention content is visible */
            .intervention-protocols * {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Force intervention cards to be visible */
            .intervention-card {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100% !important;
                margin-bottom: 1rem !important;
            }
            
            /* Ensure intervention content is not hidden */
            .intervention-protocols h2,
            .intervention-protocols h3,
            .intervention-protocols h4,
            .intervention-protocols p,
            .intervention-protocols div {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Improve button and interactive elements */
            button, .btn {
                width: 100% !important;
                padding: 0.75rem !important;
                font-size: 0.9rem !important;
            }
            
            /* Ensure tables are responsive */
            table {
                width: 100% !important;
                font-size: 0.8rem !important;
            }
            
            th, td {
                padding: 0.25rem !important;
                word-wrap: break-word !important;
            }
        }
        
        /* Additional mobile optimizations */
        @media (max-width: 480px) {
            .container {
                padding: 0.25rem !important;
            }
            
            .glassmorphic, .neumorphic {
                padding: 0.5rem !important;
                margin: 0.125rem !important;
            }
            
            h2 {
                font-size: 1.1rem !important;
            }
            
            h3 {
                font-size: 1rem !important;
            }
            
            p, span, div {
                font-size: 0.85rem !important;
            }
        }
    </style>
</head>

<body class="bg-light-bg text-gray-800 min-h-screen font-inter">
    
    <header class="glassmorphic mx-4 mt-4 p-6 mb-8">
        <div class="flex items-center justify-center mb-6">
            <i class="fas fa-heartbeat text-4xl text-neon-pink mr-4 animate-pulse"></i>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent text-center">
                Comprehensive Health Optimization Report
            </h1>
        </div>
        <div class="flex justify-center items-center space-x-6 text-sm text-gray-600 flex-wrap gap-4">
            <div class="flex items-center">
                <i class="fas fa-user-circle text-neon-green mr-2"></i>
                <span><strong>Client:</strong> analysis info, 30 years old</span>
            </div>
            <div class="flex items-center">
                <i class="fas fa-calendar-alt text-neon-blue mr-2"></i>
                <span><strong>Report Date:</strong> October 2025</span>
            </div>
            <div class="flex items-center">
                <i class="fas fa-clipboard-list text-neon-purple mr-2"></i>
                <span><strong>Report Type:</strong> Holistic Health Roadmap</span>
            </div>
        </div>
    </header>
    <div class="container mx-auto px-4 max-w-7xl">
        
        <section class="glassmorphic p-8 mb-8">
            <h2 class="text-3xl font-semibold text-neon-purple mb-6 neon-glow">
                <i class="fas fa-user-md mr-3"></i>Client Health Summary
            </h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic p-6 text-center card-highlight-blue summary-card" style="display: flex; flex-direction: column; height: 100%;">
                    <i class="fas fa-user text-3xl text-neon-blue mb-4"></i>
                    <h3 class="text-xl font-medium text-neon-blue">Profile</h3>
                    <p class="text-gray-700 editable">Total of 71 Biomarkers in 11 Categories</p>
                    <p class="text-gray-700 editable">Gender: male | Age: 30</p>
                </div>
                <div class="neumorphic p-6 text-center card-highlight-green summary-card" style="display: flex; flex-direction: column; height: 100%;">
                    <i class="fas fa-chart-line text-3xl text-neon-green mb-4"></i>
                    <h3 class="text-xl font-medium text-neon-green">Health Foundation</h3>
                    <p class="text-gray-700 editable">Your liver health is a strong foundation to build on, with excellent protein synthesis and enzyme function ensuring robust metabolism and detoxification. Enhancing your anti-inflammatory fatty acid balance and boosting antioxidant capacity are key next steps to optimize your cardiovascular health.</p>
                </div>
                <div class="neumorphic p-6 text-center card-highlight-purple summary-card" style="display: flex; flex-direction: column; height: 100%;">
                    <i class="fas fa-shield-heart text-3xl text-neon-purple mb-4"></i>
                    <h3 class="text-xl font-medium text-neon-purple">PhenoAge</h3>
                    <p class="text-gray-700 stat-number text-2xl font-bold">31.0</p>
                    <p class="text-gray-700 text-sm mt-2">Your PhenoAge of 31.0 suggests your biological age is closely aligned with your chronological age, indicating a typical pace of aging with room to improve through addressing inflammation and oxidative stress.</p>
                </div>
            </div>
            
            <div class="neumorphic-inset p-6 mb-6">
                <p class="text-gray-700 leading-relaxed text-lg">
                    <strong>Hi analysis info! At 30 years old, you have a fantastic opportunity to fine-tune your well-being with insights tailored specifically to your body’s biomarker profile. Let’s dive into what your numbers are telling us and how you can harness your strengths to elevate your health.</strong> This comprehensive analysis is based on your blood test results and individual profile. Our goal is to help you understand your current health status and provide clear guidance on how to optimize your wellness for both immediate vitality and long-term healthy aging.
                </p>
            </div>
            
            <div class="neumorphic-inset p-6">
                <p class="text-gray-700 leading-relaxed">
                    Your liver function markers are solid, with key enzymes like Alanine Aminotransferase at 19 IU/L and Aspartate Aminotransferase at 16 IU/L reflecting that your liver is performing optimally without signs of damage. Albumin and total protein levels also speak to excellent liver protein synthesis and fluid balance. However, when we look at inflammation and cardiovascular markers, some areas stand out. Your Alpha Linoleic Acid at 2 µg/mL and Linoleic Acid at 453.9 µg/mL suggest an imbalance in fatty acids that could promote inflammation. Critically, your high-sensitivity C-Reactive Protein is elevated at 20 mg/L, signaling significant systemic inflammation that may affect your cardiovascular health. Additionally, your Antioxidant Capacity ImAnOx at 270.07 µmol/L is lower than ideal, suggesting your body’s ability to combat oxidative stress could be stronger. Your omega-3 levels, like Eicosapentaenoic Acid at 5 µg/mL and an Omega-3 Fatty Acid Index of 2.83%, also indicate room for improvement in heart-protective fats. Sodium corrected concentration is low at 2078 mg/L, hinting at an electrolyte imbalance that warrants attention.
                </p>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-route mr-3"></i>Your Immediate Solutions Roadmap
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic p-6 intervention-card card-highlight-pink" style="display: flex; flex-direction: column; height: 100%;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-heart text-2xl text-neon-pink mr-4"></i>
                            <div>
                                <h3 class="text-xl font-medium text-neon-pink">Lower C-Reactive Protein</h3>
                                
                            </div>
                        </div>
                        <!-- Score hidden -->
                    </div>
                    <p class="text-gray-700 mb-4 solutions-roadmap-content flex-grow">Your C-reactive Protein level is at 20 mg/L, which is critically high and signals significant inflammation that could directly impact your cardiovascular health. This inflammation puts you at heightened risk for heart issues, so reducing this marker is paramount for your wellbeing.</p>
                    <!-- Progress bar hidden -->
                </div>
                <div class="neumorphic p-6 intervention-card card-highlight-pink" style="display: flex; flex-direction: column; height: 100%;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-seedling text-2xl text-neon-pink mr-4"></i>
                            <div>
                                <h3 class="text-xl font-medium text-neon-pink">Boost Omega-3 Levels</h3>
                                
                            </div>
                        </div>
                        <!-- Score hidden -->
                    </div>
                    <p class="text-gray-700 mb-4 solutions-roadmap-content flex-grow">The low Eicosapentaenoic Acid (EPA) level of 5 indicates your omega-3 fatty acid status is in the disease range, which is crucial for combating inflammation and supporting cardiovascular function. Increasing your intake of omega-3s through supplements like Alpha-Linolenic Acid from flaxseed oil can gently improve this deficiency.</p>
                    <!-- Progress bar hidden -->
                </div>
                <div class="neumorphic p-6 intervention-card card-highlight-orange" style="display: flex; flex-direction: column; height: 100%;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-fire text-2xl text-orange-600 mr-4"></i>
                            <div>
                                <h3 class="text-xl font-medium text-orange-600">Reduce Linoleic Acid</h3>
                                
                            </div>
                        </div>
                        <!-- Score hidden -->
                    </div>
                    <p class="text-gray-700 mb-4 solutions-roadmap-content flex-grow">Your Linoleic Acid is elevated at 453.90, falling within the disease range, which fuels inflammation and increases cardiovascular risk. Shifting your dietary fats away from excessive omega-6 sources and balancing them with anti-inflammatory fats will help restore healthier levels.</p>
                    <!-- Progress bar hidden -->
                </div>
                <div class="neumorphic p-6 intervention-card card-highlight-orange" style="display: flex; flex-direction: column; height: 100%;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-shield-alt text-2xl text-orange-600 mr-4"></i>
                            <div>
                                <h3 class="text-xl font-medium text-orange-600">Enhance Antioxidant Capacity</h3>
                                
                            </div>
                        </div>
                        <!-- Score hidden -->
                    </div>
                    <p class="text-gray-700 mb-4 solutions-roadmap-content flex-grow">Your antioxidant capacity ImAnOx is at 270.07, a level associated with increased cardiovascular risk due to oxidative stress. By improving your antioxidant defenses through nutrient-rich foods and lifestyle adjustments like walking, you can fortify your heart health against this threat.</p>
                    <!-- Progress bar hidden -->
                </div>
            </div>
            
            <div class="neumorphic-inset p-6">
                <p class="text-gray-700 italic solutions-roadmap-content">
                    <strong>The encouraging truth:</strong> Your health optimization journey is built on evidence-based strategies tailored specifically to your unique biomarker profile and health goals.
                </p>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8">
            <h2 class="text-3xl font-semibold text-neon-yellow mb-6 neon-glow">
                <i class="fas fa-sort-amount-up mr-3"></i>Your Health Priority Matrix
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
            <div class="neumorphic p-6 card-highlight-pink" style="display: flex; flex-direction: column; height: 100%;">
                <div class="flex items-center mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl text-neon-pink mr-4"></i>
                    <h3 class="text-xl font-semibold text-neon-pink">🚨 Critical & Urgent</h3>
                </div>
                <div class="space-y-3 text-sm text-gray-700 health-matrix-content flex-grow">
                        <div class="bg-neon-pink bg-opacity-10 p-3 rounded-lg">
                            <strong>Reduce Inflammation & Mineral Deficits</strong>
                            <div class="mt-2">You have several critical markers showing high inflammation and severe mineral imbalances that put your cardiovascular health and overall well-being at immediate risk. Your very high C-reactive Protein and disease-range omega-3 fatty acids signal urgent need to reduce inflammation and support heart health. Addressing your significant magnesium, manganese, potassium, sodium, calcium, phosphorus, and zinc deficiencies is also essential now to stabilize your metabolism and prevent complications.</div>
                            <div class="mt-2"><ul class="list-disc list-inside space-y-1 ml-2"><li class="text-sm">Take <strong>Alpha-Linolenic Acid (ALA, Flaxseed Oil)</strong> <strong>1000mg daily</strong> with meals containing healthy fats to improve your omega-3 fatty acid status.</li><li class="text-sm">Monitor electrolyte and mineral levels frequently with your healthcare provider and adjust diet/supplementation to address <strong>magnesium, calcium, potassium, sodium, phosphorus, and zinc</strong> imbalances.</li><li class="text-sm">Avoid processed foods high in sodium and consult on safe sodium intake to manage your <strong>high sodium correction</strong> biomarker safely.</li></ul></div>
                        </div>
                </div>
            </div>
            <div class="neumorphic p-6 card-highlight-yellow" style="display: flex; flex-direction: column; height: 100%;">
                <div class="flex items-center mb-4">
                    <i class="fas fa-star text-2xl text-neon-yellow mr-4"></i>
                    <h3 class="text-xl font-semibold text-neon-yellow">⭐ Important & Strategic</h3>
                </div>
                <div class="space-y-3 text-sm text-gray-700 health-matrix-content flex-grow">
                        <div class="bg-neon-yellow bg-opacity-10 p-3 rounded-lg">
                            <strong>Cardiovascular Support Lifestyle</strong>
                            <div class="mt-2">Your borderline omega-3 index and hemoglobin, alongside your elevated inflammation markers, call for strategic lifestyle changes to reduce cardiovascular risk over the next months. The DASH diet and walking are powerful, evidence-backed approaches that will help you lower blood pressure gently, enhance mineral balance, and reduce systemic inflammation, complementing your urgent nutrient repletion efforts.</div>
                            <div class="mt-2"><ul class="list-disc list-inside space-y-1 ml-2"><li class="text-sm">Adopt the <strong>DASH Diet</strong> focusing on fruits, vegetables, whole grains, low-fat dairy, lean meats, and nuts, with a <strong>moderate sodium limit of 1800-2300mg daily</strong>.</li><li class="text-sm">Walk briskly for <strong>30 to 60 minutes at least 5 days a week</strong>, starting gradually and wearing supportive footwear to ease joint strain.</li></ul></div>
                        </div>
                </div>
            </div>
            <div class="neumorphic p-6 card-highlight-blue" style="display: flex; flex-direction: column; height: 100%;">
                <div class="flex items-center mb-4">
                    <i class="fas fa-clock text-2xl text-neon-blue mr-4"></i>
                    <h3 class="text-xl font-semibold text-neon-blue">🔄 Important & Long-term</h3>
                </div>
                <div class="space-y-3 text-sm text-gray-700 health-matrix-content flex-grow">
                        <div class="bg-neon-blue bg-opacity-10 p-3 rounded-lg">
                            <strong>Optimize Inflammation & Aging</strong>
                            <div class="mt-2">Your phenotypic age is slightly elevated, indicating your body shows signs of accelerated aging likely linked to inflammation and oxidative stress. Long-term focus on maintaining balanced omega fatty acids, supporting cardiovascular function, and improving your metabolomics profile will help reduce chronic risk and support healthy aging.</div>
                            <div class="mt-2"><ul class="list-disc list-inside space-y-1 ml-2"><li class="text-sm">Continue consistent supplementation with <strong>ALA</strong> and consider adding marine omega-3s if advised by your healthcare provider.</li><li class="text-sm">Maintain the <strong>DASH diet</strong> long term to support mineral balance and reduce inflammation.</li><li class="text-sm">Sustain regular <strong>walking and gradually increase physical activity</strong> to improve cardiovascular fitness and metabolic health.</li></ul></div>
                        </div>
                </div>
            </div>
            <div class="neumorphic p-6 card-highlight-green" style="display: flex; flex-direction: column; height: 100%;">
                <div class="flex items-center mb-4">
                    <i class="fas fa-leaf text-2xl text-neon-green mr-4"></i>
                    <h3 class="text-xl font-semibold text-neon-green">🌿 Optional Enhancements</h3>
                </div>
                <div class="space-y-3 text-sm text-gray-700 health-matrix-content flex-grow">
                        <div class="bg-neon-green bg-opacity-10 p-3 rounded-lg">
                            <strong>Digital Detox for Mental Wellness</strong>
                            <div class="mt-2">Reducing screen time through digital detox can improve your sleep quality, lower stress, and lessen inflammation over time. While this is not as urgent as your cardiovascular and mineral concerns, incorporating screen-free periods will support your overall brain health and potentially improve your phenotypic age safely.</div>
                            <div class="mt-2"><ul class="list-disc list-inside space-y-1 ml-2"><li class="text-sm">Set a daily <strong>1 hour screen-free period before bedtime</strong> to enhance melatonin production and sleep quality.</li><li class="text-sm">Use apps to gradually reduce daily screen time by <strong>1–2 hours</strong> over weeks.</li><li class="text-sm">Plan at least <strong>one device-free day per month</strong> to help your mind reset and reduce stress.</li></ul></div>
                        </div>
                </div>
            </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-prescription-bottle mr-3"></i>Liver Function
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">6 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Liver Function Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <strong></strong> At 30 years old, your liver function is a cornerstone of your overall well-being, especially as a male managing an active lifestyle or work demands. Your liver not only detoxifies your body but also supports your metabolism and energy levels, making the health of these biomarkers crucial for maintaining vitality and preventing issues later on.

<strong>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 editable leading-relaxed mb-4">
                        </strong> Your liver markers are all in strong shape, with an <strong>Alanine Aminotransferase</strong> level of <strong>19 U/L</strong>, comfortably within the optimal range, indicating your liver cells are healthy and not under stress. Your <strong>Albumin</strong> level at <strong>661.65 mg/dL</strong> signals excellent protein synthesis capacity and fluid balance, supporting your body's resilience. Lastly, your <strong>Alkaline Phosphatase</strong> at <strong>42 U/L</strong> reflects balanced liver enzyme activity, reinforcing that your liver function is well-maintained. These markers show you’re on a very good track to keeping your liver robust for the decades ahead.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your <strong>Alanine Aminotransferase</strong>, <strong>Albumin</strong>, and <strong>Alkaline Phosphatase</strong> levels are well within optimal ranges, indicating healthy liver function at age 30. To maintain this, you should continue following a <strong>balanced diet rich in antioxidants</strong> like fruits and vegetables and engage in <strong>at least 150 minutes of moderate exercise weekly</strong> to support liver health and <strong>reduce inflammation</strong>. Avoid excessive alcohol and limit exposure to toxins to preserve your liver’s optimal function over time.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Alanine Aminotransferase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">19 <span class="text-xs font-normal">IU/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Albumin</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">661.65 <span class="text-xs font-normal">µmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Alkaline Phosphatase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">42 <span class="text-xs font-normal">IU/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Aspartate Aminotransferase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">16 <span class="text-xs font-normal">IU/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Gamma-Glutamyl Transferase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">12 <span class="text-xs font-normal">IU/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Protein</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">6.30 <span class="text-xs font-normal">g/dL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-fire mr-3"></i>Inflammation
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">3 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Inflammation Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <strong></strong> At 30 years old, maintaining healthy inflammation levels is crucial for preserving your long-term <strong>cardiovascular health</strong> and overall vitality. As a male, your body's balance of fatty acids plays a key role in how well you manage inflammation, which can impact energy, recovery, and disease risk as you age. Keeping these markers in check sets a strong foundation for lasting wellness.

<strong>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        </strong> Your <strong>Alpha Linoleic Acid</strong> level is alarmingly low at <strong>2</strong>, placing you in the <strong>disease range</strong>, and your <strong>Linoleic Acid</strong> sits at a high <strong>453.90</strong>, also signaling potential inflammatory imbalance. These two critical issues suggest your body's inflamed state might be heightened, increasing strain on your system if left unaddressed. On a positive note, your <strong>Arachidonic Acid</strong> is well within the <strong>optimal range</strong> at <strong>405.70</strong>, reflecting a solid baseline of anti-inflammatory support that you can build on. Addressing the extremes in your linoleic acids will be key to unlocking better inflammation control, energy, and long-term health resilience.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your low levels of <strong>Alpha Linoleic Acid</strong> (2) and elevated <strong>Linoleic Acid</strong> (453.90) suggest an imbalance that may contribute to chronic inflammation. To help <strong>reduce inflammation</strong> and support optimal health at 30 years old, focus on increasing your intake of foods rich in <strong>alpha-linolenic acid</strong> such as flaxseeds, chia seeds, and walnuts, while moderating consumption of oils high in linoleic acid like corn and soybean oil. Maintaining your <strong>optimal Arachidonic Acid</strong> (405.70) is beneficial, so pairing this dietary adjustment with regular <strong>30 minutes daily</strong> of moderate exercise can further promote a balanced inflammatory response.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Alpha Linoleic Acid</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">2 <span class="text-xs font-normal">µg/mL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Arachidonic Acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">405.70 <span class="text-xs font-normal">µg/mL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Linoleic Acid</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">453.90 <span class="text-xs font-normal">µg/mL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-heartbeat mr-3"></i>Cardiovascular Risk
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">13 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Cardiovascular Risk Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <section>
  <h2>IMPORTANCE</h2>
  <p>At 30 years old, your <strong>cardiovascular health</strong> sets the foundation for decades to come. This is a crucial time to address risk factors like inflammation and oxidative stress, which can silently pave the way for heart disease if left unchecked. By understanding your biomarkers now, you empower yourself to make targeted changes that safeguard your heart for the long haul.</p>
</section>

<section>
  <h2>DESCRIPTION</h2>
  <p>Your lab results reveal some critical signals that need your attention. Your <strong>C-reactive Protein, high sensitivity</strong> level is alarmingly high at <strong>20 mg/L</strong>, putting you in a <strong>CriticalRange</strong> that indicates significant systemic inflammation—a key driver of <strong>cardiovascular disease</strong>. Additionally, your <strong>Antioxidant capacity ImAnOx</strong> is at <strong>270.07 U/mL</strong>, which falls within the <strong>DiseaseRange</strong>, showing your body’s defense against oxidative damage is currently compromised. Your <strong>Eicosapentaenoic Acid (EPA)</strong> level of <strong>5%</strong> is also in the <strong>DiseaseRange</strong>, suggesting a deficiency in this heart-healthy omega-3 fatty acid that helps <strong>reduce inflammation</strong> and protect your arteries.</p>
  <p>On a positive note, some of your markers are well balanced, which gives you a solid base to build on. Your <strong>Calcium corr</strong> at <strong>634 mg/dL</strong> is within the <strong>OptimalRange</strong>, supporting healthy bone and vascular function. Your <strong>Coenzyme Q10</strong> level of <strong>03 µg/mL</strong> is also <strong>Optimal</strong>, providing crucial antioxidant support to your heart muscle. Even your <strong>Lipid peroxidation</strong> is at a favorable <strong>285.85 nmol/L</strong>, indicating relatively low damage to your lipids, which is a good sign amidst some other red flags.</p>
</section>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your cardiovascular risk markers provide insights into your current health status and areas for optimization.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            To improve your elevated <strong>C-reactive Protein, high sensitivity</strong> at <strong>20</strong> mg/L and low <strong>Antioxidant capacity ImAnOx</strong> at <strong>270.07</strong>, incorporate a <strong>Mediterranean diet</strong> rich in fruits, vegetables, and nuts, which can <strong>reduce inflammation</strong> and boost antioxidants. Additionally, increasing your intake of omega-3 fatty acids through fatty fish or a high-quality supplement to raise your <strong>Eicosapentaenoic Acid</strong> from <strong>5</strong> can support heart health and <strong>lower cardiovascular risk</strong>. Aim for at least <strong>150 minutes of moderate exercise weekly</strong> to further enhance your cardiovascular profile, especially at your age.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Antioxidant capacity ImAnOx</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">270.07 <span class="text-xs font-normal">µmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">C-reactive Protein, high sensitivity</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">20 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Calcium corr</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">61.34 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Coenzyme Q10</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">1.03 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Eicosapentaenoic Acid</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">5 <span class="text-xs font-normal">µg/mL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Lipid peroxidation</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">285.85 <span class="text-xs font-normal">µmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Magnesium corr</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">35.18 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Magnesium/Calcium Quotient</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">0.57 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-yellow">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Omega-3 Fatty Acid Index</h4>
                    <div class="text-lg font-bold text-neon-yellow mb-2 text-center">2.83 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Potassium corr</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">1853 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Potassium/Calcium Quotient</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">30.21 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Potassium/sodium ratio</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.89 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Sodium corr</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">2078 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-biohazard mr-3"></i>Immune Health and Inflammation
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">6 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Immune Health and Inflammation Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        At 30 years old, your immune health and inflammation levels are crucial because they act as your body's frontline defense, especially as you balance a busy lifestyle and increased exposure to stress and environmental factors. Maintaining optimal immune markers now, like your current ones, helps you stay resilient and supports long-term <strong>inflammation control</strong>, which is key to preventing chronic illnesses down the road.
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your blood test shows a strong immune profile with <strong>Basophils</strong> at <strong>1.30%</strong> (OptimalRange), <strong>Eosinophils</strong> at <strong>4.60%</strong> (HealthyRange), and <strong>Leukocytes</strong> at <strong>4.80 x10^9/L</strong> (OptimalRange). These numbers mean your immune system is functioning smoothly without signs of excess inflammation or allergic reaction, giving you a solid defense system. With zero critical issues detected, your body is effectively balanced, which supports your ability to <strong>reduce inflammation</strong> and maintain overall vitality. Keep nurturing these levels through good nutrition, regular exercise, and stress management to continue feeling your best.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your <strong>Basophils</strong>, <strong>Eosinophils</strong>, and <strong>Leukocytes</strong> are all within optimal or healthy ranges, indicating a well-functioning immune system without signs of inflammation. To maintain these excellent levels, focus on a <strong>Mediterranean diet</strong> rich in fruits, vegetables, and healthy fats, which can help <strong>reduce inflammation</strong> and support immune health. Incorporate <strong>at least 150 minutes of moderate exercise weekly</strong> to further enhance your immune resilience and overall well-being at 30 years old.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Basophils</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">1.30 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Eosinophils</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">4.60 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Leukocytes</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">4.80 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Lymphocytes</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">28.80 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Monocytes</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">10 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Neutrophils</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">55.30 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-industry mr-3"></i>Heavy Metals
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">4 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Heavy Metals Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        At 30 years old, your body is still in a prime position to maintain long-term health, but exposure to heavy metals like mercury can quietly impact your <strong>neurological function</strong> and overall well-being if left unchecked. As a male, your metabolism and lifestyle might expose you to environmental sources of these metals, making it crucial to keep your <strong>heavy metal levels</strong> within safe limits to protect your <strong>brain health</strong> and reduce potential risks in the years ahead.
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your <strong>mercury blood level</strong> is at <strong>20</strong>, placing you right at the <strong>BorderlineRange</strong>, which means it’s time to be proactive in reducing exposure from things like certain fish or environmental sources to avoid any buildup that could affect your <strong>nervous system</strong>. On a positive note, your <strong>cadmium</strong> at <strong>0.38</strong>, <strong>lead</strong> at <strong>4.60</strong>, and <strong>nickel</strong> at <strong>0.38</strong> are all securely within the <strong>OptimalRange</strong>, showing that your current lifestyle and environment are helping you maintain a strong defense against many heavy metal risks. Focusing on lowering your mercury further will give you even greater peace of mind and support your energy and cognitive function as you continue to thrive.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your <strong>Mercury, Blood</strong> level at 20 is in the borderline range, so you should prioritize reducing exposure by avoiding high-mercury fish such as swordfish and king mackerel, and consider incorporating <strong>chlorella or cilantro supplements</strong>, which have evidence supporting their role in mercury detoxification. Maintaining your optimal levels of <strong>Cadmium</strong>, <strong>Lead</strong>, and <strong>Nickel</strong> is great, so continue with a varied diet rich in antioxidants like vitamin C and selenium to support your body's natural heavy metal clearance, especially important for a 30-year-old male aiming to preserve long-term health.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Cadmium</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.38 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Lead</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">4.60 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-yellow">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Mercury, Blood</h4>
                    <div class="text-lg font-bold text-neon-yellow mb-2 text-center">20 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Nickel</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.38 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-gem mr-3"></i>Essential Minerals
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">16 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Essential Minerals Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <h3></h3>
At 30 years old, maintaining a balanced level of <strong>essential minerals</strong> is crucial for you as a male to support your <strong>bone strength</strong>, metabolic efficiency, and nervous system function. These minerals act as the building blocks for your overall vitality and help ward off early onset of chronic issues that can impact your <strong>muscle function</strong> and <strong>heart health</strong> as you age.

<h3>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        </h3>
Your results highlight a significant concern with your <strong>Calcium</strong> level at <strong>1.63 mmol/L</strong>, falling within a disease-related range, which means your bones and muscular contractions might not be optimally supported right now. Additionally, your <strong>Magnesium</strong> at <strong>3.39 mg/dL</strong> is critically off balance, which can affect your <strong>nerve signaling</strong> and energy production, especially important given your active male physiology. On a positive note, your <strong>Chrome</strong> at <strong>0.72 µg/mL</strong> and your well-regulated <strong>Copper/Zinc Quotient</strong> of <strong>0.15</strong> show that some of your mineral pathways are functioning at an optimal level, helping with blood sugar regulation and antioxidant defense. Addressing these critical issues with targeted nutritional strategies will empower you to protect your <strong>metabolic health</strong> and keep your body performing at its best.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your low <strong>Calcium</strong> level of <strong>1.63</strong> mmol/L and critically low <strong>Magnesium</strong> at <strong>3.39</strong> mg/dL indicate a need to increase your intake of these essential minerals, especially given your age and male gender. Incorporate foods rich in <strong>calcium</strong> such as dairy products and leafy greens, and boost your <strong>magnesium</strong> through nuts, seeds, and whole grains, or consider a high-quality supplement providing around <strong>300-400 mg magnesium daily</strong>. Since your <strong>Copper</strong> is borderline at <strong>88</strong>, maintain a balanced diet avoiding excessive copper-rich foods, and focus on bone-strengthening activities like weight-bearing exercise to naturally optimize mineral balance and support long-term bone health.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Calcium</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">1.63 <span class="text-xs font-normal">mmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Chrome</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.72 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-yellow">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Copper</h4>
                    <div class="text-lg font-bold text-neon-yellow mb-2 text-center">88 <span class="text-xs font-normal">µg/dL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">copper corr</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.87 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Copper/Zinc Quotient</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.15 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Iron</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">22.85 <span class="text-xs font-normal">µmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Magnesium</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">3.39 <span class="text-xs font-normal">mg/dL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Manganese (Serum)</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">12.57 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Molybdenum</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.50 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Phosphorus</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">33.66 <span class="text-xs font-normal">mg/dL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">potassium</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">42.65 <span class="text-xs font-normal">mmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Selenium (Serum)</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">105 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Selenium corr</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">114.08 <span class="text-xs font-normal">µg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Sodium</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">94.86 <span class="text-xs font-normal">mmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Zinc corr</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">5.70 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Zinc in Serum</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">520 <span class="text-xs font-normal">µg/dL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-vials mr-3"></i>Metabolomics
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">10 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Metabolomics Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <section>
  <h3>IMPORTANCE</h3>
  <p>At 30 years old, your metabolomics profile offers a powerful window into your body’s biochemical balance, especially as a male where maintaining optimal fatty acid ratios is key to supporting <strong>cardiovascular health</strong> and cognitive function. Tracking biomarkers like <strong>Docosahexaenoic Acid</strong> and your <strong>Omega-6/3 ratio</strong> now can help you take proactive steps to keep your metabolism efficient and inflammation low as you age.</p>
  
  <h3>DESCRIPTION</h3>
  <p>Your current values highlight some areas to focus on. Your <strong>Docosahexaenoic Acid</strong> (DHA) sits at <strong>64.10</strong>, which falls within a <strong>disease-associated range</strong>, suggesting you may benefit from increasing omega-3 intake to support brain and heart health. Your <strong>Omega-6/3 ratio</strong> is elevated at <strong>12.46</strong>, significantly above typical optimal ranges, pointing to an imbalance that can promote inflammation. Conversely, your <strong>Dihomo-gamma-linolenic acid</strong> value of <strong>26.50</strong> is in an optimal range, which is a bright spot since it plays a role in <strong>reducing inflammation</strong>. Additionally, healthy <strong>Lipase</strong> activity at <strong>20</strong> shows good fat metabolism support, and your <strong>Nervonic Acid</strong> at <strong>67.50</strong> is within a healthy range, important for nerve cell membrane integrity. Focusing on reducing your omega-6 intake while boosting omega-3 rich foods like fatty fish or supplements can help you shift these critical markers toward a healthier balance.</p>
</section>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your metabolomics markers provide insights into your current health status and areas for optimization.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your elevated <strong>Docosahexaenoic Acid</strong> and high <strong>Omega-6/3 ratio</strong> suggest an imbalance in essential fatty acids, which can promote inflammation. To <strong>reduce inflammation</strong> and improve your <strong>eicosanoid balance</strong>, focus on increasing intake of omega-3 rich foods like fatty fish or consider a high-quality omega-3 supplement at a dose of <strong>1-2 grams daily</strong>, while reducing omega-6 sources found in many vegetable oils. At 30 years old, these adjustments can help optimize your metabolic health and support long-term cardiovascular benefits.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Dihomo-gamma-linolenic acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">26.50 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Docosahexaenoic Acid</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">64.10 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Eicosanoid-ance</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">1.24 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Lipase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">20 <span class="text-xs font-normal">U/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Nervonic Acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">67.50 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Oleic Acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">584.40 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Omega-6/3 ratio</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">12.46 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Palmitic Acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">587.80 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Pancreatic Amylase</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">26 <span class="text-xs font-normal">U/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Stearic Acid</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">246.30 <span class="text-xs font-normal">mg/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-sun mr-3"></i>Vitamins
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">3 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Vitamins Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <strong></strong> At 30 years old, maintaining optimal levels of key vitamins like <strong>Folic acid</strong>, <strong>Vitamin B12</strong>, and <strong>Vitamin D3</strong> is essential for supporting your energy metabolism, cognitive function, and immune resilience. These vitamins play a crucial role in keeping you at your physical and mental best as you navigate the demands of your active adult life.

<strong>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        </strong> Your <strong>Folic acid storage status</strong> at <strong>734</strong> reflects a strong reserve that supports DNA synthesis and healthy cell function. With your <strong>active Holo Transcobalamin Vitamin B12</strong> at <strong>53.60</strong>, you’re fueling your nervous system efficiently, which is vital for maintaining focus and preventing fatigue. Additionally, your <strong>Vitamin D3 (25-OH)</strong> level of <strong>720</strong> is comfortably within the optimal range, enhancing your bone strength and immune defense. Together, these excellent numbers show you’re taking great care of your vitamin status, setting you up for lasting health and vitality.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your <strong>Folic acid storage status</strong>, <strong>Vitamin B12, active Holo Transcobalamin</strong>, and <strong>Vitamin D3 (25-OH)</strong> levels are all within the optimal range, indicating strong nutrient balance for your age and gender. To maintain these healthy levels and support overall wellness, continue consuming a balanced diet rich in leafy greens, lean proteins, and fortified foods, alongside regular safe sun exposure of about <strong>10-15 minutes daily</strong>. Additionally, consider a routine check-up every 6 to 12 months to monitor your vitamin status and adjust your intake based on lifestyle changes or seasonal shifts.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Folic acid storage status</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">734 <span class="text-xs font-normal">ng/mL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Vitamin B12, active Holo Transcobalamin</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">53.60 <span class="text-xs font-normal">pmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Vitamin D3 (25-OH)</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">72.20 <span class="text-xs font-normal">nmol/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-tint mr-3"></i>Blood
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">8 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Blood Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <section>
  <h2>IMPORTANCE</h2>
  <p>Your blood biomarkers offer a window into how efficiently your body transports oxygen and maintains overall vitality—a crucial consideration at 30 years old as your energy demands and physical activity remain high. Monitoring these markers helps you stay ahead by ensuring your blood supports your stamina and recovery, especially being male where optimal oxygen delivery impacts not just performance but long-term <strong>cardiovascular health</strong>.</p>
</section>

<section>
  <h2>DESCRIPTION</h2>
  <p>Looking at your results, your <strong>hemoglobin</strong> at <strong>115 g/L</strong> is in the borderline range, which means your blood’s capacity to carry oxygen is slightly below optimal. This is a signal to pay close attention because low hemoglobin can leave you feeling unusually tired or sluggish. On the bright side, your <strong>hematocrit</strong> at <strong>36%</strong> is well within a healthy range, and your red blood cells show excellent quality with a <strong>mean corpuscular hemoglobin</strong> of <strong>29.30 pg</strong> and <strong>mean corpuscular hemoglobin concentration</strong> at <strong>321 g/L</strong>, both reflecting strong oxygen-carrying components in your blood. These positive markers suggest your red blood cells are functioning efficiently, but addressing that borderline hemoglobin could really elevate your energy and resilience.</p>
</section>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your blood markers provide insights into your current health status and areas for optimization.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your slightly low <strong>hemoglobin</strong> level of <strong>115</strong> suggests you may benefit from enhancing your iron intake through foods like lean red meat, spinach, and legumes. Since your hematocrit and other blood indices are healthy, focus on consistent consumption of iron-rich and vitamin C–rich foods to <strong>improve absorption</strong>, and consider discussing an iron supplement with your healthcare provider if symptoms of fatigue persist. Incorporating these changes supports your overall energy and oxygen delivery, which is important for your active lifestyle at 30 years old.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Hematocrit</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">36 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-yellow">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Hemoglobin</h4>
                    <div class="text-lg font-bold text-neon-yellow mb-2 text-center">115 <span class="text-xs font-normal">g/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Mean Corpuscular Hemoglobin</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">29.30 <span class="text-xs font-normal">pg</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Mean Corpuscular Hemoglobin Concentration</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">321 <span class="text-xs font-normal">g/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Mean Corpuscular Volume</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">91 <span class="text-xs font-normal">fL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Platelets</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">284 <span class="text-xs font-normal">thousand/µL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Red Blood Cells</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">3.90 <span class="text-xs font-normal">million/µL</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Red Cell Distribution Width</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">13.10 <span class="text-xs font-normal">%</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-user-clock mr-3"></i>Phenotypic Age
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">1 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Phenotypic Age Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        <strong></strong> At 30 years old, your <strong>Phenotypic Age</strong> is a critical marker to monitor because it reflects how your body is truly aging beyond just the number of birthdays you've celebrated. For a male your age, keeping this number in check is essential to protecting your <strong>cardiovascular health</strong> and metabolic function, setting the foundation for long-term vitality.

<strong>
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        </strong> Your current <strong>Phenotypic Age</strong> of <strong>31</strong> places you in the critical range, indicating your biological age is advancing slightly faster than your chronological age. This suggests your body may be experiencing more stress or aging-related wear than expected at 30, which could increase risks for early onset <strong>chronic conditions</strong>. While this is a clear signal to act, the good news is that you have the opportunity now to implement targeted lifestyle changes that can <strong>reduce inflammation</strong> and slow this process, putting you back on the path to strong, resilient health.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your slightly elevated <strong>PhenoAge</strong> indicates your biological age is marginally higher than your chronological age, suggesting early signs of accelerated aging. To help <strong>reduce inflammation</strong> and improve your overall cellular health, prioritize a <strong>Mediterranean diet</strong> rich in fruits, vegetables, whole grains, and healthy fats, combined with at least <strong>30 minutes of moderate exercise daily</strong>. Additionally, managing stress through mindfulness or meditation can support healthy aging processes tailored to your age and gender.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-pink">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">PhenoAge</h4>
                    <div class="text-lg font-bold text-neon-pink mb-2 text-center">31 <span class="text-xs font-normal"></span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 biomarker-section-container">
            <h2 class="text-3xl font-semibold text-neon-green mb-6 neon-glow">
                <i class="fas fa-th mr-3"></i>Thyroid Function
            </h2>
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <span class="bg-neon-blue text-white px-3 py-1 rounded-full text-sm">1 Biomarkers</span>
                    <span class="bg-neon-green text-white px-3 py-1 rounded-full text-sm">0 Need Focus</span>
                </div>
            </div>
            
                <div class="neumorphic-inset p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-neon-green mb-4">Why Thyroid Function Matters for Your Longevity:</h3>
                    <p class="text-gray-700 leading-relaxed">
                        Your thyroid function plays a vital role in regulating your metabolism, energy levels, and overall hormonal balance—especially as a 30-year-old male, it’s key to maintaining your stamina and daily performance. Keeping your thyroid in check helps support your natural energy and keeps your mood steady, which is essential as you navigate your active personal and professional life.
                    </p>
                </div>
                
                <div class="neumorphic p-6 mb-6 biomarker-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">
                        Your <strong>Thyroid Stimulating Hormone (TSH)</strong> level of <strong>0.62 mIU/L</strong> sits comfortably within the optimal range, indicating your thyroid gland is responding well and producing the right amount of hormones your body needs. This balanced TSH suggests your metabolism is running efficiently, with no signs of under- or overactivity, giving you a strong foundation to sustain healthy energy and cognitive focus every day. Maintain your current lifestyle to keep this excellent marker steady and support your overall hormonal health.
                    </p>
                    
                    <div class="bg-neon-green bg-opacity-10 border border-neon-green rounded-lg p-4 biomarker-solution">
                        <h4 class="text-lg font-semibold text-neon-green mb-2">🎯 Our Solution for You:</h4>
                        <p class="text-gray-700">
                            Your <strong>Thyroid Stimulating Hormone</strong> level is well within the optimal range, indicating your thyroid function is currently balanced. To maintain this and support your thyroid health as a 30-year-old male, focus on a <strong>balanced diet rich in iodine, selenium, and zinc</strong>, which are essential for thyroid hormone production. Additionally, aim for <strong>30 minutes of moderate exercise daily</strong> to help regulate your metabolism and overall endocrine health.
                        </p>
                    </div>
                </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style="display: grid; grid-auto-rows: 1fr; align-items: stretch;">
                <div class="neumorphic biomarker-card card-highlight-green">
                    <h4 class="font-semibold text-gray-800 mb-1 text-xs text-center">Thyroid Stimulating Hormone</h4>
                    <div class="text-lg font-bold text-neon-green mb-2 text-center">0.62 <span class="text-xs font-normal">mIU/L</span></div>
                    <div class="flex-grow">
                        <p class="text-gray-600 text-xs biomarker-info"></p>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8 intervention-protocols" style="display: block !important; visibility: visible !important; opacity: 1 !important; transform: none !important;">
            <h2 class="text-3xl font-semibold text-neon-purple mb-6 neon-glow">
                <i class="fas fa-gamepad mr-3"></i>Your Personalized Intervention Protocols
            </h2>
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            <div class="neumorphic p-3 mb-2">
                <div class="flex items-center mb-6">
                    <div class="neumorphic p-4 rounded-full mr-6">
                        <i class="fas fa-pills text-3xl text-neon-purple"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-semibold text-neon-purple">SUPPLEMENTATION: Your Comprehensive Program</h3>
                        <p class="text-gray-600">Your Targeted Supplement Protocol</p>
                    </div>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Why We Chose This Specifically For You:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        Based on your comprehensive biomarker analysis, we've selected 1 supplement interventions that work synergistically to address your specific health needs. Each intervention was chosen because it targets your unique biomarker profile and health goals, creating a comprehensive program designed specifically for your health optimization journey.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Your Personal Implementation Strategy:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        This supplement program is designed to work with your lifestyle and health goals. Each component has been selected to complement the others, creating a synergistic approach that maximizes benefits while fitting into your daily routine. The interventions work together to address your specific health concerns while building a foundation for long-term wellness.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6 intervention-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-neon-purple">Alpha-Linolenic Acid (ALA, Flaxseed Oil)</h4>
                    </div>
                    <p class="text-gray-700 mb-4">Alpha-Linolenic Acid (ALA) from flaxseed oil is a crucial plant-based omega-3 fatty acid that can support your cardiovascular and inflammatory health, especially given the significant deficiencies noted in your omega-3 markers, including low alpha-linolenic acid and its downstream derivatives like EPA and DHA. Your elevated omega-6 to omega-3 ratio predisposes your system to a pro-inflammatory state that can contribute to chronic inflammation as reflected by your raised CRP levels. Supplementing with ALA helps replenish this deficient substrate, improving your body's capacity to produce anti-inflammatory lipid mediators. While endogenous conversion of ALA to EPA and DHA is limited in humans, consistent supplementation provides incremental cardiovascular benefits and supports membrane fluidity and immune regulation. Taking flaxseed oil with meals containing fat enhances its absorption and reduces gastrointestinal discomfort. Complementing supplementation with dietary sources such as flaxseeds, walnuts, and green leafy vegetables further enriches your omega-3 intake. This approach aligns with your goals to modulate systemic inflammation and optimize your metabolomics profile to reduce cardiovascular risk and promote healthy aging. Monitoring your omega-3 index over time will inform effectiveness and guide potential adjustments, including consideration of marine-derived omega-3 supplementation if needed. Maintaining balance among omega fatty acids contributes to heart health, cognitive function, and overall inflammatory status. Thus, ALA supplementation offers a well-tolerated, plant-based strategy that fits your biochemical pattern and wellness objectives.</p>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Key Benefits:</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-purple mr-2"></i>
                                <span class="text-gray-700 text-sm">Improves omega-3 fatty acid status aiming to reduce inflammation</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-purple mr-2"></i>
                                <span class="text-gray-700 text-sm">Supports cardiovascular health and reduces pro-inflammatory risks</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-purple mr-2"></i>
                                <span class="text-gray-700 text-sm">Easily absorbed when taken with meals containing fat</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-purple mr-2"></i>
                                <span class="text-gray-700 text-sm">Suitable plant-based omega-3 source consistent with dietary preferences</span>
                            </div></div></div>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Implementation Guide:</h5>
                        <div class="space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-purple mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Take 1000 mg flaxseed oil daily with meals that contain healthy fats.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-purple mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Add other plant-based omega-3 foods like walnuts and chia seeds to your diet.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-purple mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Regularly check your omega-3 status with your healthcare provider to measure progress.</span>
                            </div></div></div>
                    <div class="bg-purple-100 p-3 rounded-lg mb-4">
                        <h5 class="font-semibold text-purple-800 mb-1">💊 Dosage:</h5>
                        <p class="text-purple-700 text-sm">1000 mg</p>
                    </div></div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Expected Benefits:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <i class="fas fa-heart text-neon-purple mr-3"></i>
                            <span class="text-gray-700">Supports your overall health optimization</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-neon-purple mr-3"></i>
                            <span class="text-gray-700">Enhances energy and vitality</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield text-neon-purple mr-3"></i>
                            <span class="text-gray-700">Strengthens your health foundation</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-neon-purple mr-3"></i>
                            <span class="text-gray-700">Optimizes your biomarker profile</span>
                        </div>
                    </div>
                </div></div>
            <div class="neumorphic p-3 mb-2">
                <div class="flex items-center mb-6">
                    <div class="neumorphic p-4 rounded-full mr-6">
                        <i class="fas fa-leaf text-3xl text-neon-green"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-semibold text-neon-green">NUTRITION: Your Comprehensive Program</h3>
                        <p class="text-gray-600">Your Primary Nutrition Protocol</p>
                    </div>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Why We Chose This Specifically For You:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        Based on your comprehensive biomarker analysis, we've selected 1 diet interventions that work synergistically to address your specific health needs. Each intervention was chosen because it targets your unique biomarker profile and health goals, creating a comprehensive program designed specifically for your health optimization journey.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Your Personal Implementation Strategy:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        This diet program is designed to work with your lifestyle and health goals. Each component has been selected to complement the others, creating a synergistic approach that maximizes benefits while fitting into your daily routine. The interventions work together to address your specific health concerns while building a foundation for long-term wellness.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6 intervention-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-neon-green">DASH Diet</h4>
                    </div>
                    <p class="text-gray-700 mb-4">The DASH (Dietary Approaches to Stop Hypertension) Diet is a medically-proven, nutrient-rich eating plan designed primarily to reduce high blood pressure and improve cardiovascular health. It emphasizes a high intake of fruits, vegetables, whole grains, and low-fat dairy products to provide essential minerals like potassium, calcium, and magnesium, all supportive of healthy blood pressure regulation. Lean meats, fish, poultry, and nuts complement the nutrient density while limiting saturated fat and cholesterol. In your case, given elevated cardiovascular risk and inflammatory markers like high-sensitivity C-Reactive Protein (CRP), alongside an elevated blood pressure profile, the DASH Diet is particularly appropriate. However, your serum sodium and sodium corrected levels are below optimal ranges, necessitating a cautious approach to sodium reduction to avoid risks of hyponatremia or electrolyte imbalance. A gradual and moderate limitation of sodium (targeting approximately 1,500 to 2,300 mg daily) with frequent laboratory monitoring will help prevent adverse effects. Using herbs, spices, and salt-free seasoning blends can enhance flavor without added sodium. Your potassium levels are adequate, allowing inclusion of potassium-rich foods that aid cardiovascular regulation, but these should be adjusted as necessary if kidney function remains stable. Low-fat dairy inclusion is favorable as no allergies are noted and supports calcium intake. Avoidance of processed and canned foods high in sodium and unhealthy fats is critical. This diet supports weight management, reduces hypertension, and lowers the risk of diabetes, all beneficial for your metabolic profile. Consistency and monitoring will ensure beneficial outcomes while safeguarding against electrolyte disturbances.</p>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Key Benefits:</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-green mr-2"></i>
                                <span class="text-gray-700 text-sm">You will lower your blood pressure through increased intake of fruits, vegetables, and low-fat dairy.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-green mr-2"></i>
                                <span class="text-gray-700 text-sm">You improve cardiovascular health and reduce inflammation.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-green mr-2"></i>
                                <span class="text-gray-700 text-sm">You maintain balanced electrolytes by moderating sodium intake carefully.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-green mr-2"></i>
                                <span class="text-gray-700 text-sm">You support weight management with nutrient-dense, low-fat foods.</span>
                            </div></div></div>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Implementation Guide:</h5>
                        <div class="space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-green mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Eat plenty of fruits, vegetables, low-fat dairy, and whole grains to help lower your blood pressure.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-green mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Limit your sodium intake moderately to about 1,800 to 2,300 mg per day, gradually reducing salt and avoiding processed foods.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-green mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Use herbs and spices instead of salt to flavor your meals.</span>
                            </div></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h5 class="font-semibold text-green-600 mb-2">✅ Include:</h5>
                            <div class="text-sm text-gray-700 space-y-1">
                                <div class="flex items-center">
                                    <i class="fas fa-plus text-green-600 mr-2 text-xs"></i>
                                    <span>Eat 4-5 servings of fruits and vegetables daily rich in potassium and antioxidants.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-plus text-green-600 mr-2 text-xs"></i>
                                    <span>Include 6-8 servings of whole grains daily.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-plus text-green-600 mr-2 text-xs"></i>
                                    <span>Consume low-fat dairy products regularly.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-plus text-green-600 mr-2 text-xs"></i>
                                    <span>Choose lean meats, fish, poultry, and nuts.</span>
                                </div></div></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h5 class="font-semibold text-red-600 mb-2">❌ Avoid:</h5>
                            <div class="text-sm text-gray-700 space-y-1">
                                <div class="flex items-center">
                                    <i class="fas fa-times text-red-600 mr-2 text-xs"></i>
                                    <span>Avoid processed, canned, and packaged foods high in sodium.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-times text-red-600 mr-2 text-xs"></i>
                                    <span>Limit added salt in cooking and at the table.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-times text-red-600 mr-2 text-xs"></i>
                                    <span>Avoid overly restrictive sodium limitation to prevent hyponatremia.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-times text-red-600 mr-2 text-xs"></i>
                                    <span>Do not eliminate dairy if no allergy is present to maintain calcium intake.</span>
                                </div></div></div></div></div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Expected Benefits:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <i class="fas fa-heart text-neon-green mr-3"></i>
                            <span class="text-gray-700">Supports your overall health optimization</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-neon-green mr-3"></i>
                            <span class="text-gray-700">Enhances energy and vitality</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield text-neon-green mr-3"></i>
                            <span class="text-gray-700">Strengthens your health foundation</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-neon-green mr-3"></i>
                            <span class="text-gray-700">Optimizes your biomarker profile</span>
                        </div>
                    </div>
                </div></div>
            <div class="neumorphic p-3 mb-2">
                <div class="flex items-center mb-6">
                    <div class="neumorphic p-4 rounded-full mr-6">
                        <i class="fas fa-running text-3xl text-neon-blue"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-semibold text-neon-blue">MOVEMENT: Your Comprehensive Program</h3>
                        <p class="text-gray-600">Your Primary Movement Protocol</p>
                    </div>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Why We Chose This Specifically For You:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        Based on your comprehensive biomarker analysis, we've selected 1 activity interventions that work synergistically to address your specific health needs. Each intervention was chosen because it targets your unique biomarker profile and health goals, creating a comprehensive program designed specifically for your health optimization journey.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Your Personal Implementation Strategy:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        This activity program is designed to work with your lifestyle and health goals. Each component has been selected to complement the others, creating a synergistic approach that maximizes benefits while fitting into your daily routine. The interventions work together to address your specific health concerns while building a foundation for long-term wellness.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6 intervention-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-neon-blue">Walking</h4>
                    </div>
                    <p class="text-gray-700 mb-4">Walking is a fundamental, low-impact aerobic activity well matched to your current health profile characterized by elevated inflammation and low omega-3 fatty acids, both of which increase cardiovascular risk. Walking briskly for at least 30 minutes most days of the week helps optimize heart function, improve circulation, and assist in weight management, all crucial to reducing systemic inflammatory burden. Because your liver function and mobility are within optimal range, walking poses minimal risk, but given the borderline hemoglobin and a possible trend toward minor joint vulnerability, it is essential to adopt a gradual progression strategy in intensity and duration to allow your body to safely adapt. Supportive footwear is important to reduce risk of soft tissue injuries such as shin splints or blisters. Monitoring how your knees and ankles respond will help avoid overuse injuries that could counteract your progress. Tracking daily steps can build motivation and quantify improvement, with a goal of 7,000 to 10,000 steps daily to ensure cardiovascular fitness gains. This accessible activity not only reduces the inflammatory markers highlighted in your labs but also supports mood, sleep, and overall metabolic health, making it a highly effective cornerstone of your health optimization plan. Over time, incorporating complementary strength or flexibility training can further enhance your physical resilience and cardiovascular benefits.</p>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Key Benefits:</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-blue mr-2"></i>
                                <span class="text-gray-700 text-sm">Boost your heart and circulation safely with low-impact exercise.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-blue mr-2"></i>
                                <span class="text-gray-700 text-sm">Support weight control and reduce systemic inflammation over time.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-blue mr-2"></i>
                                <span class="text-gray-700 text-sm">Maintain joint health by progressing gradually and wearing proper shoes.</span>
                            </div></div></div>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Implementation Guide:</h5>
                        <div class="space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-blue mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Aim to walk briskly for 30 to 60 minutes at least 5 days a week to improve your heart health and reduce inflammation.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-blue mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Wear good, supportive shoes to protect your feet and prevent blisters or shin splints.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-blue mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Start slowly and increase your pace and walking time gradually, paying attention to any joint discomfort and resting as needed.</span>
                            </div></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h5 class="font-semibold text-blue-600 mb-2">🏃‍♂️ Do:</h5>
                            <div class="text-sm text-gray-700 space-y-1">
                                <div class="flex items-center">
                                    <i class="fas fa-check text-blue-600 mr-2 text-xs"></i>
                                    <span>Walk briskly at 3-4 mph for 30-60 minutes per session, 5-7 times weekly.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check text-blue-600 mr-2 text-xs"></i>
                                    <span>Track steps aiming for 7,000-10,000 daily.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check text-blue-600 mr-2 text-xs"></i>
                                    <span>Increase duration or pace gradually while monitoring joint comfort.</span>
                                </div></div></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h5 class="font-semibold text-orange-600 mb-2">⚠️ Avoid:</h5>
                            <div class="text-sm text-gray-700 space-y-1">
                                <div class="flex items-center">
                                    <i class="fas fa-exclamation-triangle text-orange-600 mr-2 text-xs"></i>
                                    <span>Avoid sudden intense impact activities that may stress joints.</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-exclamation-triangle text-orange-600 mr-2 text-xs"></i>
                                    <span>Do not walk long distances on hard or uneven surfaces without proper footwear.</span>
                                </div></div></div></div></div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Expected Benefits:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <i class="fas fa-heart text-neon-blue mr-3"></i>
                            <span class="text-gray-700">Supports your overall health optimization</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-neon-blue mr-3"></i>
                            <span class="text-gray-700">Enhances energy and vitality</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield text-neon-blue mr-3"></i>
                            <span class="text-gray-700">Strengthens your health foundation</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-neon-blue mr-3"></i>
                            <span class="text-gray-700">Optimizes your biomarker profile</span>
                        </div>
                    </div>
                </div></div>
            <div class="neumorphic p-3 mb-2">
                <div class="flex items-center mb-6">
                    <div class="neumorphic p-4 rounded-full mr-6">
                        <i class="fas fa-spa text-3xl text-neon-pink"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-semibold text-neon-pink">LIFESTYLE: Your Comprehensive Program</h3>
                        <p class="text-gray-600">Your Holistic Lifestyle Protocol</p>
                    </div>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Why We Chose This Specifically For You:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        Based on your comprehensive biomarker analysis, we've selected 1 lifestyle interventions that work synergistically to address your specific health needs. Each intervention was chosen because it targets your unique biomarker profile and health goals, creating a comprehensive program designed specifically for your health optimization journey.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Your Personal Implementation Strategy:</h4>
                    <p class="text-gray-700 leading-relaxed">
                        This lifestyle program is designed to work with your lifestyle and health goals. Each component has been selected to complement the others, creating a synergistic approach that maximizes benefits while fitting into your daily routine. The interventions work together to address your specific health concerns while building a foundation for long-term wellness.
                    </p>
                </div>
                <div class="neumorphic-inset p-6 mb-6 intervention-card">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold text-neon-pink">Digital Detox</h4>
                    </div>
                    <p class="text-gray-700 mb-4">Digital devices such as smartphones, computers, and televisions play a major role in modern life but can contribute to poor sleep and increased mental stress — factors directly influencing systemic inflammation and cognitive aging. Your elevated C-Reactive Protein and suboptimal omega-3 fatty acid status suggest inflammation and oxidative stress that can be worsened by chronic screen exposure, blue light, and disrupted sleep patterns. Introducing a digital detox involves setting intentional screen-free windows during the day, most beneficially the hour before bedtime, to promote natural circadian rhythms and better quality, restorative sleep. This reduction in screen time lowers cognitive load and reduces exposure to blue light, which suppresses melatonin — a key hormone for sleep regulation. Using controlled applications to monitor and limit your screen usage helps create achievable goals and track progress. Planning device-free days or weekends allows extended recovery from constant digital stimulation and attenuates stress markers, supporting immune and metabolic health. Given evidence linking improved sleep and reduced stress to lower mortality risk, your phenotypic biological age may improve with sustained detox practices. Because anxiety symptoms may fluctuate as you reduce reliance on digital connections, begin progressively and prioritize gentle relaxation techniques during detox intervals. Avoid abrupt, strict detoxes that might worsen anxiety or challenge essential social and occupational tasks. Tailoring digital detox timing and duration to your lifestyle will help you optimize mental wellbeing, reduce inflammation, and preserve brain longevity safely and sustainably.</p>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Key Benefits:</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-pink mr-2"></i>
                                <span class="text-gray-700 text-sm">Improves your sleep quality and helps you feel more rested.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-pink mr-2"></i>
                                <span class="text-gray-700 text-sm">Lowers stress and reduces inflammation in your body.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-neon-pink mr-2"></i>
                                <span class="text-gray-700 text-sm">Boosts your focus and strengthens your relationships.</span>
                            </div></div></div>
                    <div class="mb-4">
                        <h5 class="font-semibold text-gray-800 mb-2">Implementation Guide:</h5>
                        <div class="space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-pink mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Set aside at least 1 hour before bedtime with no screens to help improve your sleep quality.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-pink mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Use apps like Freedom or Apple Screen Time to gradually reduce your daily screen time by 1–2 hours.</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-arrow-right text-neon-pink mr-2 mt-1 text-xs"></i>
                                <span class="text-gray-700 text-sm">Plan at least one device-free day or weekend per month to give your mind a break and lower stress.</span>
                            </div></div></div></div>
                <div class="neumorphic-inset p-6 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">Expected Benefits:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <i class="fas fa-heart text-neon-pink mr-3"></i>
                            <span class="text-gray-700">Supports your overall health optimization</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-neon-pink mr-3"></i>
                            <span class="text-gray-700">Enhances energy and vitality</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield text-neon-pink mr-3"></i>
                            <span class="text-gray-700">Strengthens your health foundation</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-neon-pink mr-3"></i>
                            <span class="text-gray-700">Optimizes your biomarker profile</span>
                        </div>
                    </div>
                </div></div>
        </section>

        <section class="glassmorphic p-8 mb-8">
            <h2 class="text-3xl font-semibold text-neon-purple mb-8 neon-glow">
                <i class="fas fa-map-marked-alt mr-3"></i>Your Health Transformation Roadmap
            </h2>
            
            <div class="neumorphic-inset p-6 mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">The Science of Sustainable Change:</h3>
                <p class="text-gray-700 leading-relaxed">
                    Your transformation focuses on reducing systemic inflammation and correcting critical mineral imbalances that elevate your cardiovascular risk and accelerate biological aging. By replenishing deficient omega-3 fatty acids, moderating sodium intake, and enhancing antioxidant capacity through diet, supplementation, and lifestyle changes, you'll restore your body's capacity to regulate inflammation and improve cardiovascular function.
                </p>
            </div>
            
            <div class="neumorphic p-6 mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Your Holistic Health Strategy:</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    
                    <div class="neumorphic-inset p-6 text-center">
                        <div class="text-lg font-semibold text-neon-pink mb-2">1. Critical Health Focus: Reduce Inflammation and Correct Mineral Deficiencies</div>
                        <p class="text-gray-600 text-sm">Given your elevated C-reactive protein, low omega-3 fatty acid indices, and disturbances in essential minerals like magnesium, calcium, potassium, and sodium, addressing these issues immediately lowers your cardiovascular risk and systemic inflammation.</p>
                    </div>
                    <div class="neumorphic-inset p-6 text-center">
                        <div class="text-lg font-semibold text-neon-green mb-2">2. Foundation Building: Improve Cardiovascular Health with Nutrition and Activity</div>
                        <p class="text-gray-600 text-sm">Adopting the DASH diet tailored to your mineral status and incorporating daily walking strengthens your heart and vascular system while supporting healthy blood pressure and circulation.</p>
                    </div>
                    <div class="neumorphic-inset p-6 text-center">
                        <div class="text-lg font-semibold text-neon-blue mb-2">3. Optimization Phase: Enhance Omega-3 Status and Antioxidant Capacity</div>
                        <p class="text-gray-600 text-sm">Supplementing with plant-based alpha-linolenic acid and elevating dietary omega-3 sources will improve your fatty acid profile, reduce pro-inflammatory signals, and boost antioxidant defenses critical for metabolic health and aging.</p>
                    </div>
                    <div class="neumorphic-inset p-6 text-center">
                        <div class="text-lg font-semibold text-neon-purple mb-2">4. Long-term Maintenance: Sustain Healthy Lifestyle and Minimize Digital Stress</div>
                        <p class="text-gray-600 text-sm">Implementing routine digital detox periods reduces mental stress and improves sleep quality, supporting chronic inflammation reduction and preserving your cognitive and cardiovascular health over time.</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="neumorphic-inset p-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Expected Transformation:</h4>
                        <div class="space-y-3">
                            
                            <div class="flex items-center">
                                <i class="fas fa-bullseye text-neon-pink mr-3"></i>
                                <span class="text-gray-700"><strong>Biomarker Improvements:</strong> You can expect decreases in C-reactive protein and omega-6/3 ratio, normalization of mineral levels such as magnesium and calcium, and an increased omega-3 fatty acid index reflecting reduced inflammation and cardiovascular risk.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-bullseye text-neon-pink mr-3"></i>
                                <span class="text-gray-700"><strong>Health System Enhancements:</strong> Your cardiovascular and immune systems will function more efficiently with balanced electrolytes, improved antioxidant capacity, and enhanced lipid profiles, lowering your disease susceptibility.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-bullseye text-neon-pink mr-3"></i>
                                <span class="text-gray-700"><strong>Quality of Life Improvements:</strong> You will experience better energy, reduced systemic inflammation symptoms, improved sleep quality, and enhanced physical endurance through consistent activity and lifestyle adjustments.</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-bullseye text-neon-pink mr-3"></i>
                                <span class="text-gray-700"><strong>Long-term Benefits:</strong> Sustained improvements will contribute to healthy aging by lowering your phenotypic age, reducing risk for chronic diseases, and preserving cognitive and cardiovascular function well into the future.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="neumorphic-inset p-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-4">Success Indicators:</h4>
                        <div class="space-y-3">
                            
                            <div class="flex items-center">
                                <i class="fas fa-chart-line text-neon-yellow mr-3"></i>
                                <span class="text-gray-700">Reduction of high-sensitivity C-reactive protein from 20 mg/L to within normal range (<3 mg/L)</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-chart-line text-neon-yellow mr-3"></i>
                                <span class="text-gray-700">Increase of Omega-3 Fatty Acid Index from 2.83 to above 4.0</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-chart-line text-neon-yellow mr-3"></i>
                                <span class="text-gray-700">Normalization of magnesium, calcium, sodium, and potassium levels within optimal ranges</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-chart-line text-neon-yellow mr-3"></i>
                                <span class="text-gray-700">Improvement in phenotypic biological age from 31 to equal or below your chronological age of 30 years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8">
            <h2 class="text-3xl font-semibold text-neon-blue mb-6 neon-glow">
                <i class="fas fa-adjust mr-3"></i>Your Flexible Implementation Framework
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                <div class="neumorphic p-6 card-highlight-green">
                    <div class="text-center mb-4">
                        <i class="fas fa-battery-quarter text-3xl text-neon-green mb-3"></i>
                        <h3 class="text-xl font-semibold text-neon-green">Minimum Effective Dose</h3>
                        <p class="text-sm text-gray-600">20% effort → 80% results</p>
                    </div>
                    <div class="text-sm text-gray-700">
                        <div class="font-semibold text-gray-800 mb-3">Focus Area:</div>
                        <ul class="list-disc list-inside space-y-2 ml-2">
                            <li class='mb-2 leading-relaxed'>Take 1000 mg flaxseed oil (Alpha-Linolenic Acid) daily with meals containing healthy fats to begin addressing your low omega-3 fatty acid status and reduce systemic inflammation.</li><li class='mb-2 leading-relaxed'>Adopt key principles of the DASH Diet by increasing your intake of fruits, vegetables, and low-fat dairy to support cardiovascular health and improve mineral balance without drastic sodium changes.</li><li class='mb-2 leading-relaxed'>Aim to walk briskly for 30 minutes at least 3 days per week to improve your heart health, circulation, and reduce inflammation with low impact on joints.</li><li class='mb-2 leading-relaxed'>Set a digital-free period of at least 1 hour before bedtime to improve your sleep quality, reduce mental stress, and support inflammatory regulation.</li><li class='mb-2 leading-relaxed'>Monitor your CRP, omega-3 index, and essential mineral levels regularly with your healthcare provider for early feedback on intervention effectiveness.</li>
                        </ul>
                    </div>
                </div>
                <div class="neumorphic p-6 card-highlight-blue">
                    <div class="text-center mb-4">
                        <i class="fas fa-battery-half text-3xl text-neon-blue mb-3"></i>
                        <h3 class="text-xl font-semibold text-neon-blue">Standard Protocol</h3>
                        <p class="text-sm text-gray-600">Balanced comprehensive approach</p>
                    </div>
                    <div class="text-sm text-gray-700">
                        <div class="font-semibold text-gray-800 mb-3">Focus Area:</div>
                        <ul class="list-disc list-inside space-y-2 ml-2">
                            <li class='mb-2 leading-relaxed'>Take 1000 mg flaxseed oil daily with fat-containing meals consistently, and incorporate additional plant-based omega-3 foods such as walnuts, chia seeds, and green leafy vegetables into your diet.</li><li class='mb-2 leading-relaxed'>Follow the DASH Diet more thoroughly by targeting a moderate sodium intake between 1,800 to 2,300 mg per day, emphasizing whole grains, lean meats, fish, nuts, and low-fat dairy while limiting processed and canned foods.</li><li class='mb-2 leading-relaxed'>Increase walking to 30-60 minutes most days of the week, gradually increasing distance and pace while wearing supportive footwear to protect joints and prevent injury.</li><li class='mb-2 leading-relaxed'>Extend your digital detox by gradually reducing daily screen time by 1–2 hours using monitoring apps and plan one device-free weekend per month to lower mental stress and systemic inflammation.</li><li class='mb-2 leading-relaxed'>Closely track key biomarkers including CRP, omega-3 index, hemoglobin, calcium, magnesium, potassium, sodium, and phenotypic age every 3-6 months to guide adjustments in your interventions.</li>
                        </ul>
                    </div>
                </div>
                <div class="neumorphic p-6 card-highlight-purple">
                    <div class="text-center mb-4">
                        <i class="fas fa-battery-full text-3xl text-neon-purple mb-3"></i>
                        <h3 class="text-xl font-semibold text-neon-purple">Maximum Optimization</h3>
                        <p class="text-sm text-gray-600">For high-motivation individuals</p>
                    </div>
                    <div class="text-sm text-gray-700">
                        <div class="font-semibold text-gray-800 mb-3">Focus Area:</div>
                        <ul class="list-disc list-inside space-y-2 ml-2">
                            <li class='mb-2 leading-relaxed'>Take 1000 mg flaxseed oil daily plus increase intake of diverse omega-3 rich foods including walnuts, chia seeds, flaxseeds, and green leafy vegetables; consider periodic evaluation for marine-based omega-3 supplementation if omega-3 markers remain low.</li><li class='mb-2 leading-relaxed'>Strictly adhere to a finely-tuned DASH Diet with targeted electrolyte balance monitoring, using herbs and spices for flavor, minimizing sodium intake carefully while ensuring adequate intake of potassium, calcium, magnesium, and zinc through diet and supplements if needed.</li><li class='mb-2 leading-relaxed'>Walk briskly for 30-60 minutes daily, include complementary strengthening and flexibility exercises to improve joint resilience and overall cardiovascular fitness safely.</li><li class='mb-2 leading-relaxed'>Implement an advanced digital detox strategy by setting multiple daily screen-free intervals, using apps to enforce limits, and integrating mindfulness or relaxation techniques during detox periods to optimize sleep, reduce inflammation, and support cognitive aging.</li><li class='mb-2 leading-relaxed'>Engage your healthcare provider in frequent biomarker monitoring every 2-3 months—focus on cardiovascular risk markers (CRP, omega-3 index, magnesium/calcium quotient), essential minerals, hemoglobin, and phenotypic age to guide fine-tuning of your holistic plan toward ideal biomarker ranges.</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            
            <div class="neumorphic-inset p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Choose Your Starting Point:</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                    
                    <div class="text-center">
                        <div class="font-semibold text-neon-green mb-1">You feel overwhelmed, busy, or stressed:</div>
                        <div>Start with the Minimum Effective Dose to address your most critical biomarker imbalances with low daily effort.</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold text-neon-blue mb-1">You want a balanced plan you can follow consistently:</div>
                        <div>Adopt the Standard Protocol for steady and comprehensive improvements in inflammation, cardiovascular risk, and mineral balance.</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold text-neon-purple mb-1">You are highly motivated and want to optimize your health fully:</div>
                        <div>Choose Maximum Optimization for a rigorous, detailed approach targeting all critical biomarkers and promoting optimal aging.</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="glassmorphic p-8 mb-8">
            <div class="text-center mb-8">
                <i class="fas fa-heart text-4xl text-neon-green mb-4 animate-pulse-glow"></i>
                <h2 class="text-3xl font-semibold text-neon-green neon-glow">💝 Your Personal Message</h2>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="neumorphic p-8 mb-6">
                    <p class="text-2xl text-center text-neon-green font-semibold mb-8">
                        Your health optimization journey is unique to you.
                    </p>
                    
                    <div class="neumorphic-inset p-6 mb-6">
                        <p class="text-gray-700 leading-relaxed text-lg mb-6">
                            This comprehensive report is designed to empower you with knowledge and actionable strategies tailored specifically to your health profile. Every recommendation is based on your individual biomarkers and health status.
                        </p>
                    </div>
                    
                    <div class="neumorphic-inset p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Remember:</h3>
                        <p class="text-gray-700 leading-relaxed">
                            This isn't about perfection – it's about progress. Each positive change builds on your existing health foundation. You're not just improving numbers on a lab report – you're investing in decades of vitality, energy, and life satisfaction ahead.
                        </p>
                    </div>
                </div>
                
                <div class="text-center">
                    <div class="inline-block neumorphic px-8 py-4 rounded-full">
                        <p class="text-neon-green font-semibold text-lg final-message">
                            Your journey to optimal health continues with this roadmap. Every choice you make supports your long-term vitality. You have everything you need to succeed – let's optimize your health together.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
    
    <footer class="glassmorphic mx-4 mb-4 p-6 text-center">
        <p class="text-gray-600 text-sm leading-relaxed">
            <em>This report is designed to empower you with knowledge and actionable strategies. 
            While these lifestyle modifications can significantly improve your health markers, 
            continue any prescribed medications and consult with healthcare professionals for medical concerns. 
            Your health transformation is a partnership between your commitment and professional guidance.</em>
        </p>
    </footer>
    
    <script>
        // Add smooth scroll behavior
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    </script>
</body>
</html>


`;

export default htmlMoch;