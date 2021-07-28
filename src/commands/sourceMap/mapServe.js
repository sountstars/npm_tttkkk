
//加载模块
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
const L = require('../../utils/log');
const tkSetting = require('../../setting.json') 
 
var server = http.createServer(function(req, res){
    // path1 + path2 + path3   主机地址 + 文件加 + 文件名称
    const path3 = req.url;
    const pathObj = url.parse(req.url, true);	 
    let path2 = ''
    if(path3 === '/favicon.ico') {
        res.write('','binary');
        res.end();	
        return
    }
    if(/js.map/.test(pathObj)) {
        path2 = '/js'
    }
    if(/css.map/.test(pathObj)) {
        path2 = '/css'
    }

    const path1 = path.join( tkSetting.cource_map.baseLocal + path2);        
    var filePath = path.join(path1, pathObj.pathname);   
    L.info('filePath===>', filePath)  
    let  fileContent = '文件未找到'
    try {
        fileContent = fs.readFileSync(filePath,'binary');	  
    } catch (error) {
    }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write(fileContent,'binary');
    res.end();	
});



 
module.exports = () =>  {
    L.info('当前读取map文件路径为===>', tkSetting.cource_map.baseLocal)
    server.listen(10010);
    L.success('服务启动成功！')
}

