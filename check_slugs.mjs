
import { marked } from 'marked';

const headers = [
    "1. 矩阵的加减法",
    "2. 矩阵的乘法",
    "3. 转置矩阵",
    "4. 逆矩阵",
    "5. 伴随矩阵（Adjugate）",
    "6. 知识总结表"
];

headers.forEach(h => {
    const markdown = `## ${h}`;
    const html = marked(markdown);
    console.log(`Header: "${h}" -> HTML: ${html.trim()}`);
});
