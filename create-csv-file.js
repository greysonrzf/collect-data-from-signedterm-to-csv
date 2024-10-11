import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createObjectCsvWriter } from 'csv-writer';
import {glob} from 'glob';

async function extractDataFromPDF(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const projetoRegex = /Projeto:\s*(.*?),\s*Gerente:\s*(.*?),\s*Supervisor:\s*(.*?)$/m;
    const pessoaRegex = /Eu,\s*(.*?)\s*portador do CPF N°:\s*([\d.-]+)/;
    const marcaRegex = /Marca:\s*(.*?)\s*\|/;
    const modeloRegex = /Modelo:\s*(.*?)$/m;
    const imeiRegex = /IMEI:\s*(\d+)/;
    const numeroLinhaRegex = /Número da Linha:\s*\((\d+)\)\s*(\d{4,5}-\d{4})/;
    const operadoraRegex = /Nome da Operadora:\s*(.*?)$/m;
    const carregadorRegex = /Carregador:\s*([\wÀ-ÿ]+)/;
    const chipRegex = /Chip:\s*([\wÀ-ÿ]+)/;
    const capaRegex = /Capa:\s*([\wÀ-ÿ]+)/;
    const peliculaRegex = /Película:\s*([\wÀ-ÿ]+)/;
    const observacoesRegex = /Observações:\s*(.*?)$/m;

    const projetoMatch = text.match(projetoRegex);
    const pessoaMatch = text.match(pessoaRegex);
    const marcaMatch = text.match(marcaRegex);
    const modeloMatch = text.match(modeloRegex);
    const imeiMatch = text.match(imeiRegex);
    const numeroLinhaMatch = text.match(numeroLinhaRegex);
    const operadoraMatch = text.match(operadoraRegex);
    const carregadorMatch = text.match(carregadorRegex);
    const chipMatch = text.match(chipRegex);
    const capaMatch = text.match(capaRegex);
    const peliculaMatch = text.match(peliculaRegex);
    const observacoesMatch = text.match(observacoesRegex);

    return {
      NomeArquivo: path.basename(filePath).toUpperCase(),
      CPF: pessoaMatch ? pessoaMatch[2].toUpperCase() : '',
      Nome: pessoaMatch ? pessoaMatch[1].toUpperCase() : '',
      Projeto: projetoMatch ? projetoMatch[1].toUpperCase() : '',
      Gerente: projetoMatch ? projetoMatch[2].toUpperCase() : '',
      Supervisor: projetoMatch ? projetoMatch[3].trim().toUpperCase() : '',
      Marca: marcaMatch ? marcaMatch[1].toUpperCase() : '',
      Modelo: modeloMatch ? modeloMatch[1].toUpperCase() : '',
      IMEI: imeiMatch ? imeiMatch[1].toUpperCase() : '',
      NumeroLinha: numeroLinhaMatch ? `(${numeroLinhaMatch[1]}) ${numeroLinhaMatch[2]}`.toUpperCase() : '',
      NomeOperadora: operadoraMatch ? operadoraMatch[1].toUpperCase() : '',
      Carregador: carregadorMatch ? carregadorMatch[1].toUpperCase() : '',
      Chip: chipMatch ? chipMatch[1].toUpperCase() : '',
      Capa: capaMatch ? capaMatch[1].toUpperCase() : '',
      Pelicula: peliculaMatch ? peliculaMatch[1].toUpperCase() : '',
      Observacoes: observacoesMatch ? observacoesMatch[1].toUpperCase() : '',
    };
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error.message);
    return null;
  }
}

(async () => {
  try {
    const pdfFiles = glob.sync('./test/data/*.pdf');

    if (pdfFiles.length === 0) {
      console.log('Nenhum arquivo PDF encontrado no diretório ./test/data/');
      return;
    }

    const allData = await Promise.all(pdfFiles.map(extractDataFromPDF));

    const validData = allData.filter(data => data !== null);

    const csvFilePath = path.join(process.cwd(), 'dados_extraidos.csv');

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'NomeArquivo', title: 'Nome do Arquivo' },
        { id: 'CPF', title: 'CPF' },
        { id: 'Nome', title: 'Nome' },
        { id: 'Projeto', title: 'Projeto' },
        { id: 'Gerente', title: 'Gerente' },
        { id: 'Supervisor', title: 'Supervisor' },
        { id: 'Marca', title: 'Marca' },
        { id: 'Modelo', title: 'Modelo' },
        { id: 'IMEI', title: 'IMEI' },
        { id: 'NumeroLinha', title: 'Número da Linha' },
        { id: 'NomeOperadora', title: 'Nome da Operadora' },
        { id: 'Carregador', title: 'Carregador' },
        { id: 'Chip', title: 'Chip' },
        { id: 'Capa', title: 'Capa' },
        { id: 'Pelicula', title: 'Película' },
        { id: 'Observacoes', title: 'Observações' },
      ],
      fieldDelimiter: ';',
    });

    await csvWriter.writeRecords(validData);
    console.log(`Arquivo CSV gerado com sucesso: ${csvFilePath}`);
    console.log(`Total de arquivos processados: ${validData.length}`);

  } catch (error) {
    console.error('Erro ao processar os PDFs:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
})();