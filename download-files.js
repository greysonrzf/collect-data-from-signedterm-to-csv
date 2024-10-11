import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const links = [
  'https://xxxxx.s3.amazonaws.com/2024/10/pdf/xxxxxx/xxxxxx.pdf'
];

const pastaDestino = path.join(__dirname, 'test', 'data');

async function baixarArquivo(url, caminhoDestino) {
  try {
    const resposta = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const escritor = fs.createWriteStream(caminhoDestino);
    resposta.data.pipe(escritor);

    return new Promise((resolve, reject) => {
      escritor.on('finish', resolve);
      escritor.on('error', reject);
    });
  } catch (erro) {
    console.error(`Erro ao baixar ${url}: ${erro.message}`);
  }
}

async function baixarTodosArquivos() {
  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
  }

  for (const link of links) {
    const nomeArquivo = path.basename(link);
    const caminhoDestino = path.join(pastaDestino, nomeArquivo);
    
    console.log(`Baixando ${nomeArquivo}...`);
    await baixarArquivo(link, caminhoDestino);
    console.log(`${nomeArquivo} baixado com sucesso!`);
  }

  console.log('Todos os arquivos foram baixados.');
}

baixarTodosArquivos();