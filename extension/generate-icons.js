/**
 * Script para gerar ícones PNG a partir do SVG do cursor vermelho
 * Execute: node generate-icons.js
 */

const fs = require('fs')
const path = require('path')

// SVG do cursor vermelho
const svgContent = `<svg width="89" height="111" viewBox="0 0 89 111" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 110.5C0.00144213 110.496 0.00325732 110.491 0.00544354 110.486L44 0L89 110.5L44 81C29.5523 90.2997 0.609641 109.163 0.00544354 110.486L0 110.5Z" fill="#DA0028"/>
</svg>`

// Tamanhos necessários
const sizes = [16, 48, 128]

console.log('Para gerar os ícones PNG, você tem duas opções:')
console.log('')
console.log('OPÇÃO 1: Usar o arquivo HTML (mais fácil)')
console.log('1. Abra extension/convert-icon.html no navegador')
console.log('2. Clique nos botões para baixar cada tamanho')
console.log('3. Salve os arquivos na pasta extension/')
console.log('')
console.log('OPÇÃO 2: Usar ferramenta online')
console.log('1. Acesse https://convertio.co/svg-png/ ou similar')
console.log('2. Faça upload do arquivo: public/assets/brand/navigation_cursor/navigation-cursor-red.svg')
console.log('3. Converta para PNG nos tamanhos: 16x16, 48x48, 128x128')
console.log('4. Salve os arquivos como icon16.png, icon48.png, icon128.png na pasta extension/')
console.log('')
console.log('OPÇÃO 3: Copiar o SVG diretamente')
console.log('O SVG já está disponível em: public/assets/brand/navigation_cursor/navigation-cursor-red.svg')
console.log('Você pode usar este arquivo diretamente se a extensão suportar SVG (mas Chrome requer PNG)')

