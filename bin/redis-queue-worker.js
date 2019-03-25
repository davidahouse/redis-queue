#!/usr/bin/env node
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const redis = require('redis')

const conf = require('rc')('redisqueueworker', {
  // defaults
  sourceRedisHost: 'localhost',
  sourceRedisPort: 6379,
  sourceRedisPassword: null,
  sourceQueueName: 'github',
  targetRedisHost: 'localhost',
  targetRedisPort: 6379,
  targetRedisPassword: null,
  targetQueueName: 'github'
})

let sourceClient = createRedisClient(conf.sourceRedisHost, conf.sourceRedisPort, 
                                      conf.sourceRedisPassword)
let targetClient = createRedisClient(conf.targetRedisHost, conf.targetRedisPort,
                                      conf.targetRedisPassword)

sourceClient.on('error', function(err) {
  console.log('source redis connect error: ' + err)
})

targetClient.on('error', function(err) {
  console.log('target redis connect error: ' + err)
})

clear()
console.log(chalk.red(figlet.textSync('redisQworker', {horizontalLayout: 'full'})))
console.log(chalk.red('Source Redis Host: ' + conf.sourceRedisHost))
console.log(chalk.red('Source Redis Port: ' + conf.sourceRedisPort))
console.log(chalk.red('Target Redis Host: ' + conf.targetRedisHost))
console.log(chalk.red('Target Redis Port: ' + conf.targetRedisPort))

checkSourceQueue()

function checkSourceQueue() {
  sourceClient.brpop(conf.sourceQueueName, 5, function(list, item) {
    if (item) {
      console.log(chalk.yellow('--> ' + conf.sourceQueueName))
      targetClient.rpush(conf.targetQueueName, item)
    }
    process.nextTick(checkSourceQueue)
  })
}

function createRedisClient(host, port, password) {
  if (password != null) {
    return redis.createClient({host: host, 
                               port: port, 
                               password: password})
  } else {
    return redis.createClient({host: host, 
                               port: port})
  }
}