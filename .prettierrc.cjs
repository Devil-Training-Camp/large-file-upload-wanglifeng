module.export = {
    // 一行最多150个字符，超过换行
    printWidth: 150,
    // 指定每个缩进级别的空格数
    tabWidth: 2,
    // 使用制表符而不是空格缩进行
    useTabs: true,
    // 在语句末尾打印分号
    semi: false,
    // 使用单引号
    singleQuote: true,
    // 多行时尽可能打印尾随逗号。es5是尾部逗号兼容es5，none就是没有尾部逗号，all是指所有可能的情况，需要node8和es2017以上的环境。（trailingComma: "<es5|none|all>"
    trailingComma: 'es5',
    // 对象文字中的括号之间打印空格
    bracketSpacing: true,
    // 在单独的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x
    arrowParens: 'always',
    // 使用默认的折行标准 always\never\preserve
    proseWrap: 'preserve',
    // Vue文件脚本和样式标签缩进
    vueIndentScriptAndStyle: false,
    // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
    endOfLine: 'auto',
}