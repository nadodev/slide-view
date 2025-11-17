import { useEffect, useRef } from 'react';

let mermaidInitialized = false;
let mermaidInstance: any = null;

export function useMermaid(html: string) {
  const processedRef = useRef(new Set<string>());

  useEffect(() => {
    // Importar e inicializar Mermaid dinamicamente
    const initMermaid = async () => {
      try {
        // Importar Mermaid apenas uma vez
        if (!mermaidInstance) {
          const mermaidModule = await import('mermaid');
          mermaidInstance = mermaidModule.default;
        }

        // Inicializar apenas uma vez
        if (!mermaidInitialized) {
          mermaidInstance.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              primaryColor: '#3b82f6',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#60a5fa',
              lineColor: '#94a3b8',
              secondaryColor: '#1e293b',
              tertiaryColor: '#0f172a',
              background: '#0f172a',
              mainBkg: '#1e293b',
              textColor: '#e2e8f0',
              edgeLabelBackground: '#1e293b',
              clusterBkg: '#1e293b',
              clusterBorder: '#475569',
              defaultLinkColor: '#60a5fa',
              titleColor: '#ffffff',
              actorBorder: '#3b82f6',
              actorBkg: '#1e293b',
              actorTextColor: '#e2e8f0',
              actorLineColor: '#94a3b8',
              signalColor: '#e2e8f0',
              signalTextColor: '#e2e8f0',
              labelBoxBkgColor: '#1e293b',
              labelBoxBorderColor: '#475569',
              labelTextColor: '#e2e8f0',
              loopTextColor: '#e2e8f0',
              noteBorderColor: '#475569',
              noteBkgColor: '#1e293b',
              noteTextColor: '#e2e8f0',
              activationBorderColor: '#3b82f6',
              activationBkgColor: '#1e293b',
              sequenceNumberColor: '#ffffff',
              sectionBkgColor: '#1e293b',
              altBkgColor: '#0f172a',
              sectionBorderColor: '#475569',
              altBorderColor: '#475569',
            },
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
            },
          });
          mermaidInitialized = true;
        }

        // Aguardar um pouco mais para garantir que o DOM foi atualizado
        await new Promise(resolve => setTimeout(resolve, 200));

        // Encontrar todos os elementos mermaid e renderizar
        const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed])');
        
        if (mermaidElements.length > 0) {
          const renderPromises = Array.from(mermaidElements).map(async (element, index) => {
            const elementId = element.id || `mermaid-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            if (!element.id) {
              element.id = elementId;
            }
            
            // Verificar se já foi processado
            if (processedRef.current.has(elementId)) {
              return;
            }
            
            element.setAttribute('data-processed', 'true');
            processedRef.current.add(elementId);
            
            try {
              // Pegar o texto do elemento, preservando quebras de linha
              let graphDefinition = '';
              if (element.textContent) {
                graphDefinition = element.textContent.trim();
              } else if (element.innerHTML) {
                // Se textContent não funcionar, tentar innerHTML e limpar tags
                graphDefinition = element.innerHTML.replace(/<[^>]*>/g, '').trim();
              }
              
              if (graphDefinition) {
                console.log('Renderizando Mermaid:', elementId);
                console.log('Definição:', graphDefinition);
                
                // Usar render com um ID único para o SVG
                const renderId = `mermaid-render-${elementId}`;
                const result = await mermaidInstance.render(renderId, graphDefinition);
                
                // Limpar o conteúdo e inserir o SVG
                element.innerHTML = result.svg;
                console.log('Mermaid renderizado com sucesso:', elementId);
              } else {
                console.warn('Mermaid element sem conteúdo:', elementId, element);
                element.innerHTML = `<p style="color: #fbbf24; padding: 1rem;">Aguardando conteúdo do diagrama...</p>`;
              }
            } catch (error) {
              console.error('Erro ao renderizar Mermaid:', error, elementId);
              const errorMsg = error instanceof Error ? error.message : String(error);
              element.innerHTML = `<div style="color: #f87171; padding: 1rem; background: rgba(248, 113, 113, 0.1); border-radius: 0.5rem; border: 1px solid rgba(248, 113, 113, 0.3);">
                <strong>Erro ao renderizar diagrama Mermaid</strong><br/>
                <small>${errorMsg}</small>
              </div>`;
            }
          });
          
          await Promise.all(renderPromises);
        }
      } catch (error) {
        console.error('Erro ao carregar Mermaid:', error);
      }
    };

    if (html) {
      // Aguardar um pouco para garantir que o DOM foi atualizado
      const timeout = setTimeout(() => {
        initMermaid();
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [html]);
}

