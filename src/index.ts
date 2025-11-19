export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Misaka23323</title>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --accent-color: #007aff;
            --nav-height: 60px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        /* Navbar */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--nav-height);
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #eaeaea;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2rem;
            z-index: 1000;
        }

        .logo {
            font-weight: 700;
            font-size: 1.2rem;
            text-decoration: none;
            color: var(--text-color);
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
            align-items: center;
        }

        .nav-item a {
            text-decoration: none;
            color: var(--text-color);
            font-size: 0.95rem;
            transition: color 0.2s;
        }

        .nav-item a:hover {
            color: var(--accent-color);
        }

        /* Dropdown */
        .dropdown {
            position: relative;
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #eaeaea;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            min-width: 150px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.2s ease;
            list-style: none;
            padding: 0.5rem 0;
        }

        .dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-item a {
            display: block;
            padding: 0.5rem 1.5rem;
            color: var(--text-color);
            text-decoration: none;
            font-size: 0.9rem;
        }

        .dropdown-item a:hover {
            background-color: #f5f5f5;
            color: var(--accent-color);
        }

        /* Mobile Menu */
        .menu-toggle {
            display: none;
            cursor: pointer;
            font-size: 1.5rem;
        }

        /* Main Content */
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: calc(var(--nav-height) + 4rem) 2rem 4rem;
        }

        .hero {
            text-align: center;
            margin-bottom: 4rem;
        }

        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 800;
        }

        .hero p {
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
        }

        .section {
            margin-bottom: 3rem;
        }

        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eaeaea;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
                position: absolute;
                top: var(--nav-height);
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 1rem;
                border-bottom: 1px solid #eaeaea;
                gap: 1rem;
            }

            .nav-links.active {
                display: flex;
            }

            .menu-toggle {
                display: block;
            }

            .dropdown-menu {
                position: static;
                box-shadow: none;
                border: none;
                padding-left: 1rem;
                display: none;
                opacity: 1;
                visibility: visible;
                transform: none;
            }
            
            .dropdown.active .dropdown-menu {
                display: block;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="#" class="logo">Misaka23323</a>
        <div class="menu-toggle">☰</div>
        <ul class="nav-links">
            <li class="nav-item"><a href="#">Home</a></li>
            <li class="nav-item"><a href="#about">About</a></li>
            <li class="nav-item dropdown">
                <a href="#">Projects ▾</a>
                <ul class="dropdown-menu">
                    <li class="dropdown-item"><a href="#">Web Dev</a></li>
                    <li class="dropdown-item"><a href="#">Mobile Apps</a></li>
                    <li class="dropdown-item"><a href="#">Open Source</a></li>
                </ul>
            </li>
            <li class="nav-item"><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <main class="container">
        <section class="hero">
            <h1>Hello, I'm Misaka</h1>
            <p>A passionate developer building things for the web.</p>
        </section>

        <section id="about" class="section">
            <h2>About Me</h2>
            <p>I am a software engineer with a love for clean code and minimalist design. I specialize in TypeScript, React, and Cloudflare Workers.</p>
        </section>

        <section id="projects" class="section">
            <h2>Recent Work</h2>
            <p>Check out my projects in the dropdown menu above to see what I've been working on lately.</p>
        </section>
    </main>

    <script>
        // Mobile Menu Toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Mobile Dropdown Toggle
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    // e.preventDefault(); // Optional: prevent link navigation if clicking the parent
                    dropdown.classList.toggle('active');
                }
            });
        });
    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
