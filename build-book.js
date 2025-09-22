const fs = require('fs-extra');
const path = require('path');

class BookBuilder {
    constructor() {
        this.bookFiles = [];
        this.excludeFiles = [
            'book-outline.md',
            'README.md',
            'package.json',
            'build-book.js',
            'node_modules',
            '.git',
            '.DS_Store',
            '文件列表.md',
            'claude code基本介绍.md',
            '智能AI编程效率提升利器.md'
        ];
        this.outputFile = 'complete-book.md';
    }

    async scanFiles() {
        const chaptersDir = './chapters';
        const files = await fs.readdir(chaptersDir);
        
        // 获取所有章节文件
        const chapterFiles = files.filter(file => {
            return file.endsWith('.md') && 
                   !this.excludeFiles.includes(file) &&
                   (file.match(/^\d+/) || file.match(/^\d+\./));
        });

        // 按文件名排序
        chapterFiles.sort((a, b) => {
            const getChapterNumber = (filename) => {
                const match = filename.match(/^(\d+)(?:\.(\d+))?/);
                if (!match) return [999, 999];
                return [parseInt(match[1]), parseInt(match[2] || 0)];
            };

            const [aChapter, aSection] = getChapterNumber(a);
            const [bChapter, bSection] = getChapterNumber(b);

            if (aChapter !== bChapter) {
                return aChapter - bChapter;
            }
            return aSection - bSection;
        });

        this.bookFiles = chapterFiles;
        return chapterFiles;
    }

    async readFileContent(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return content.trim();
        } catch (error) {
            console.log(`警告: 无法读取文件 ${filePath}`);
            return '';
        }
    }

    async buildBook() {
        console.log('🚀 开始构建AI编程完整书籍...');
        
        // 扫描文件
        const files = await this.scanFiles();
        console.log(`📁 找到 ${files.length} 个章节文件`);

        let bookContent = '';
        
        // 添加书籍标题和目录
        bookContent += '# AI编程完整书籍\n\n';
        bookContent += '> 本文件由自动化脚本生成，包含完整的AI编程书籍内容\n\n';
        bookContent += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        
        // 添加目录
        bookContent += '## 📖 目录\n\n';
        for (const file of files) {
            const title = file.replace('.md', '').replace(/^\d+\.?\d*-?/, '');
            const anchor = title.toLowerCase().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-');
            bookContent += `- [${title}](#${anchor})\n`;
        }
        bookContent += '\n---\n\n';

        // 合并所有章节内容
        for (const file of files) {
            console.log(`📖 处理文件: ${file}`);
            
            const filePath = path.join('./chapters', file);
            const content = await this.readFileContent(filePath);
            if (content) {
                // 添加章节分隔
                bookContent += `\n\n---\n\n`;
                
                // 如果内容没有一级标题，添加文件名作为标题
                if (!content.startsWith('#')) {
                    const title = file.replace('.md', '').replace(/^\d+\.?\d*-?/, '');
                    bookContent += `# ${title}\n\n`;
                }
                
                bookContent += content;
                bookContent += '\n\n';
            }
        }

        // 添加结尾
        bookContent += '\n\n---\n\n';
        bookContent += '## 📝 版权声明\n\n';
        bookContent += '本书为开源项目，遵循相应开源协议。\n\n';
        bookContent += `构建完成时间: ${new Date().toLocaleString('zh-CN')}\n`;

        // 写入文件
        await fs.writeFile(this.outputFile, bookContent, 'utf8');
        
        console.log(`✅ 书籍构建完成！`);
        console.log(`📄 输出文件: ${this.outputFile}`);
        console.log(`📊 总计处理 ${files.length} 个文件`);
        console.log(`📏 总字数约: ${bookContent.length} 字符`);
    }

    async run() {
        try {
            await this.buildBook();
        } catch (error) {
            console.error('❌ 构建失败:', error.message);
            process.exit(1);
        }
    }
}

// 运行构建器
const builder = new BookBuilder();
builder.run();