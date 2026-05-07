import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure multer for file uploads (storing in memory for this demo)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // Helper for simulated processing (fallback)
  const simulateProcessing = (file: Express.Multer.File, res: express.Response) => {
    setTimeout(() => {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      res.json({
        success: true,
        isDemo: true,
        processedImageUrl: base64Image,
        metadata: {
          originalName: file.originalname,
          processedAt: new Date().toISOString(),
          cleaningModel: 'logicflow-cleanslate-v1-fallback'
        }
      });
    }, 1000);
  };

  // API Route for CleanSlate handwriting removal
  app.post('/api/cleanslate-remove-handwriting', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const externalApiUrl = process.env.CLEANSLATE_API_URL;

    // Use external API if URL is provided
    if (externalApiUrl) {
      try {
        console.log(`Connecting to external handwriting removal API: ${externalApiUrl}`);
        
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('image', blob, req.file.originalname);

        const apiResponse = await fetch(externalApiUrl, {
          method: 'POST',
          body: formData,
        });

        if (apiResponse.ok) {
          const contentType = apiResponse.headers.get('content-type') || '';
          
          if (contentType.includes('image/')) {
            const buffer = await apiResponse.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            return res.json({
              success: true,
              isDemo: false,
              processedImageUrl: `data:${contentType};base64,${base64}`,
              metadata: {
                originalName: req.file.originalname,
                processedAt: new Date().toISOString(),
                cleaningModel: 'logicflow-cleanslate-external'
              }
            });
          } else {
            // Assume it might be JSON with a base64 string
            const result = await apiResponse.json() as any;
            if (result.processedImageUrl || result.image || result.data) {
              const imageStr = result.processedImageUrl || result.image || result.data;
              // If it's already a data URL, use it, otherwise wrap it
              const processedUrl = imageStr.startsWith('data:') ? imageStr : `data:image/png;base64,${imageStr}`;
              return res.json({
                success: true,
                isDemo: false,
                processedImageUrl: processedUrl,
                metadata: {
                  originalName: req.file.originalname,
                  processedAt: new Date().toISOString(),
                  cleaningModel: 'logicflow-cleanslate-external'
                }
              });
            }
          }
        }
        console.warn('External API returned an error or unexpected format. Falling back to demo cleanup.');
      } catch (error) {
        console.error('Error connecting to external handwriting removal API:', error);
      }
    }

    // Fallback to demo processing
    console.log('Using fallback demo simulation for handwriting removal.');
    return simulateProcessing(req.file, res);
  });

  // API Route for DSE Solver - Structural Placeholder
  // Real AI integration implemented in frontend for optimal platform security/performance
  app.post('/api/solve-dse-question', upload.single('image'), async (req, res) => {
    const { text, syllabus } = req.body;
    
    if (!req.file && !text) {
      return res.status(400).json({ error: 'Either an image or text must be provided' });
    }

    // This endpoint exists as a structural reference for backend-ready deployments.
    // In this preview environment, the Gemini AI logic is handled in the frontend 
    // using the @google/genai SDK for native platform integration.
    
    res.json({
      success: true,
      message: 'Backend structural endpoint received request. Processing is handled by frontend AI.',
      syllabusReceived: syllabus
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
