// Utilitários para integração com GitHub API

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface GitHubFile {
  name: string;
  content: string;
  sha?: string;
}

/**
 * Buscar arquivos markdown de um repositório GitHub
 */
export async function fetchFilesFromGitHub(config: GitHubConfig): Promise<GitHubFile[]> {
  const { token, owner, repo, branch = 'main', path = '' } = config;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    const markdownFiles: GitHubFile[] = [];

    for (const file of Array.isArray(files) ? files : [files]) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        // Buscar conteúdo do arquivo
        const contentResponse = await fetch(file.download_url, {
          headers: {
            'Authorization': `token ${token}`
          }
        });
        
        if (contentResponse.ok) {
          const content = await contentResponse.text();
          markdownFiles.push({
            name: file.name,
            content,
            sha: file.sha
          });
        }
      } else if (file.type === 'dir') {
        // Recursivamente buscar arquivos em subdiretórios
        const subFiles = await fetchFilesFromGitHub({
          ...config,
          path: `${path}/${file.name}`.replace(/^\//, '')
        });
        markdownFiles.push(...subFiles);
      }
    }

    return markdownFiles;
  } catch (error) {
    console.error('Erro ao buscar arquivos do GitHub:', error);
    throw error;
  }
}

/**
 * Fazer push de arquivos para o GitHub
 */
export async function pushFilesToGitHub(
  config: GitHubConfig,
  files: GitHubFile[],
  commitMessage: string = 'Update markdown files'
): Promise<void> {
  const { token, owner, repo, branch = 'main', path = '' } = config;
  
  try {
    // 1. Buscar SHA do branch atual
    const branchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!branchResponse.ok) {
      throw new Error(`Erro ao buscar branch: ${branchResponse.statusText}`);
    }

    const branchData = await branchResponse.json();
    const baseSha = branchData.object.sha;

    // 2. Buscar tree atual
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${baseSha}?recursive=1`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    const treeData = await treeResponse.json();
    const existingFiles = new Map(
      treeData.tree
        .filter((item: any) => item.type === 'blob' && item.path.endsWith('.md'))
        .map((item: any) => [item.path, item.sha])
    );

    // 3. Criar blobs para os arquivos
    const tree: any[] = [];
    
    for (const file of files) {
      const filePath = path ? `${path}/${file.name}` : file.name;
      const content = btoa(unescape(encodeURIComponent(file.content)));
      
      const blobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            content,
            encoding: 'base64'
          })
        }
      );

      if (!blobResponse.ok) {
        throw new Error(`Erro ao criar blob para ${file.name}`);
      }

      const blobData = await blobResponse.json();
      tree.push({
        path: filePath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      });
    }

    // 4. Criar novo tree
    const newTreeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          base_tree: baseSha,
          tree
        })
      }
    );

    if (!newTreeResponse.ok) {
      throw new Error(`Erro ao criar tree: ${newTreeResponse.statusText}`);
    }

    const newTreeData = await newTreeResponse.json();

    // 5. Criar commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeData.sha,
          parents: [baseSha]
        })
      }
    );

    if (!commitResponse.ok) {
      throw new Error(`Erro ao criar commit: ${commitResponse.statusText}`);
    }

    const commitData = await commitResponse.json();

    // 6. Atualizar branch
    const updateBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          sha: commitData.sha
        })
      }
    );

    if (!updateBranchResponse.ok) {
      throw new Error(`Erro ao atualizar branch: ${updateBranchResponse.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao fazer push para GitHub:', error);
    throw error;
  }
}

/**
 * Verificar se o token do GitHub é válido
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

