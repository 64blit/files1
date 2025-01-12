const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
let savedUrl = '';

// Increase the maximum number of listeners
require('events').EventEmitter.defaultMaxListeners = 20;

// Middleware to log all requests
app.use((req, res, next) =>
{
    console.log('Incoming request:', req.method, req.path);
    next();
});

app.use('/proxy', (req, res, next) =>
{
    const targetUrl = req.query.iframe;

    // Validate URL to prevent open proxy abuse
    if (!targetUrl || !/^https?:\/\/.+/.test(targetUrl))
    {
        console.log('🔭files1/proxy.js:27/(targetUrl):', targetUrl)

        return res.status(400).send('Invalid or missing URL');
    }

    // Save the URL for subsequent requests
    savedUrl = targetUrl;
    console.log('🎡files1/proxy.js:34/(savedUrl):', savedUrl)

    // Proxy configuration for dynamic URLs
    const proxyMiddleware = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        secure: false, // Accepts self-signed/invalid SSL certificates
        followRedirects: true,
        onProxyReq: (proxyReq, req, res) =>
        {
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyReq.setHeader('Content-Type', 'application/javascript');
            }
        },
        onProxyRes: (proxyRes, req, res) =>
        {
            delete proxyRes.headers[ 'x-frame-options' ];
            delete proxyRes.headers[ 'content-security-policy' ];

            // Set correct MIME type for JavaScript and TypeScript files
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }
            // Set correct MIME type for font files
            if (req.path.endsWith('.otf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/otf';
            }
            if (req.path.endsWith('.ttf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/ttf';
            }

            // Handle cases where the MIME type might be incorrectly set to "text/html"
            if (proxyRes.headers[ 'content-type' ] === 'text/html' && req.path.endsWith('.js'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }

            // Log the JavaScript content
            if (req.path.endsWith('.js'))
            {
                let body = '';
                proxyRes.on('data', (chunk) =>
                {
                    body += chunk;
                });
                proxyRes.on('end', () =>
                {
                    console.log('JavaScript content:', body);
                });
            }
        },
        onError: (err, req, res) =>
        {
            console.error('Proxy error:', err); // Log proxy error
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
        }
    });

    proxyMiddleware(req, res, next);
});

// Middleware to set correct MIME type for JavaScript, TypeScript, and font files
app.use((req, res, next) =>
{
    if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
    {
        console.log('🛰️files1/proxy.js:55/(req.path):', req.path)
        res.setHeader('Content-Type', 'application/javascript');
    }
    if (req.path.endsWith('.otf'))
    {
        res.setHeader('Content-Type', 'font/otf');
    }
    if (req.path.endsWith('.ttf'))
    {
        res.setHeader('Content-Type', 'font/ttf');
    }
    next();
});

// Proxy static files from the saved URL
app.use('/proxy/*', (req, res, next) =>
{
    if (!savedUrl)
    {
        console.log('🎡files1/proxy.js:105/(!savedUrl):', !savedUrl)
        return res.status(400).send('No URL saved from initial request');
    }
    const proxyMiddleware = createProxyMiddleware({
        target: savedUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) =>
        {
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyReq.setHeader('Content-Type', 'application/javascript');
            }
        },
        onProxyRes: (proxyRes, req, res) =>
        {
            delete proxyRes.headers[ 'x-frame-options' ];
            delete proxyRes.headers[ 'content-security-policy' ];

            // Set correct MIME type for JavaScript and TypeScript files
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }
            // Set correct MIME type for font files
            if (req.path.endsWith('.otf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/otf';
            }
            if (req.path.endsWith('.ttf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/ttf';
            }

            // Handle cases where the MIME type might be incorrectly set to "text/html"
            if (proxyRes.headers[ 'content-type' ] === 'text/html' && req.path.endsWith('.js'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }

            // Log the JavaScript content
            if (req.path.endsWith('.js'))
            {
                let body = '';
                proxyRes.on('data', (chunk) =>
                {
                    body += chunk;
                });
                proxyRes.on('end', () =>
                {
                    console.log('JavaScript content:', body);
                });
            }
        },
        onError: (err, req, res) =>
        {
            console.error('Proxy error:', err); // Log proxy error
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
        }
    });

    proxyMiddleware(req, res, next);
});

// Handle all other paths dynamically
app.use('/*', (req, res, next) =>
{
    if (!savedUrl)
    {
        console.log('🍩files1/proxy.js:122/(!savedUrl):', !savedUrl)
        return res.status(400).send('No URL saved from initial request');
    }
    const proxyMiddleware = createProxyMiddleware({
        target: savedUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) =>
        {
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyReq.setHeader('Content-Type', 'application/javascript');
            }
        },
        onProxyRes: (proxyRes, req, res) =>
        {
            delete proxyRes.headers[ 'x-frame-options' ];
            delete proxyRes.headers[ 'content-security-policy' ];

            // Set correct MIME type for JavaScript and TypeScript files
            if (req.path.endsWith('.js') || req.path.endsWith('.jsx') || req.path.endsWith('.ts') || req.path.endsWith('.tsx'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }
            // Set correct MIME type for font files
            if (req.path.endsWith('.otf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/otf';
            }
            if (req.path.endsWith('.ttf'))
            {
                proxyRes.headers[ 'content-type' ] = 'font/ttf';
            }

            // Handle cases where the MIME type might be incorrectly set to "text/html"
            if (proxyRes.headers[ 'content-type' ] === 'text/html' && req.path.endsWith('.js'))
            {
                proxyRes.headers[ 'content-type' ] = 'application/javascript';
            }

            // Log the JavaScript content
            if (req.path.endsWith('.js'))
            {
                let body = '';
                proxyRes.on('data', (chunk) =>
                {
                    body += chunk;
                });
                proxyRes.on('end', () =>
                {
                    console.log('JavaScript content:', body);
                });
            }
        },
        onError: (err, req, res) =>
        {
            console.error('Proxy error:', err); // Log proxy error
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
        }
    });

    proxyMiddleware(req, res, next);
});

app.listen(3000, () => console.log('Proxy running at http://localhost:3000'));
