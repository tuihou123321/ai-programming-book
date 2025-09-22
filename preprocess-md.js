#!/usr/bin/env node
/**
 * MD预处理脚本：为正文段落添加首行缩进
 * 用法: node preprocess-md.js <输入文件> <输出文件>
 */

const fs = require('fs');
const path = require('path');

function preprocessMarkdown(inputFile, outputFile) {
    try {
        // 读取原始文件
        const content = fs.readFileSync(inputFile, 'utf8');
        const lines = content.split('\n');
        
        let processedLines = [];
        let inCodeBlock = false;
        let codeBlockMarker = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // 检查代码块标记
            if (trimmedLine.startsWith('```') || trimmedLine.startsWith('~~~')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeBlockMarker = trimmedLine.substr(0, 3);
                } else if (trimmedLine.startsWith(codeBlockMarker)) {
                    inCodeBlock = false;
                    codeBlockMarker = '';
                }
                processedLines.push(line);
                continue;
            }
            
            // 如果在代码块中，直接添加原行
            if (inCodeBlock) {
                processedLines.push(line);
                continue;
            }
            
            // 直接添加原行，不做任何缩进处理
            processedLines.push(line);
        }
        
        // 写入处理后的文件
        fs.writeFileSync(outputFile, processedLines.join('\n'), 'utf8');
        console.log(`预处理完成: ${inputFile} -> ${outputFile}`);
        
    } catch (error) {
        console.error(`预处理失败: ${error.message}`);
        process.exit(1);
    }
}

// 该函数已不再使用，保留以防后续需要
function isNormalParagraph(line, allLines, currentIndex) {
    return false; // 禁用所有段落处理
}

// 主程序
if (require.main === module) {
    if (process.argv.length !== 4) {
        console.log('用法: node preprocess-md.js <输入文件> <输出文件>');
        process.exit(1);
    }
    
    const inputFile = process.argv[2];
    const outputFile = process.argv[3];
    
    preprocessMarkdown(inputFile, outputFile);
}

module.exports = { preprocessMarkdown };