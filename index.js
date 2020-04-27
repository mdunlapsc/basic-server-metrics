const redis = require('redis');
const util  = require('util');
const os = require('os');
const si = require('systeminformation');

// Calculate metrics.
// TASK 1:
class Agent
{
    memoryLoad()
    {
       //console.log( os.totalmem(), os.freemem() );
       let load=(os.totalmem()-os.freemem())/os.totalmem()*100;
       return load.toFixed(2);
       //return (numeral(load).format('000.00'));
    }

    memoryUsed()
    {
        let used = (os.totalmem()-os.freemem())/parseInt('1073741824');
        return used.toFixed(2);
        //return used;
    }

    async cpu()
    {

       //let load = JSON.parse(si.currentLoad().cpu.currentLoad);
       let load = (await si.currentLoad()).currentload;
       return load.toFixed(2); 
       //return (numeral(load).format('000.00'));
    }
}

(async () => 
{
    // Get agent name from command line.
    let args = process.argv.slice(2);
    main(args[0]);

})();


async function main(name)
{
    let agent = new Agent();

    let connection = redis.createClient(6379, '192.168.44.47', {})
    connection.on('error', function(e)
    {
        console.log(e);
        process.exit(1);
    });
    let client = {};
    client.publish = util.promisify(connection.publish).bind(connection);

    // Push update ever 1 second
    setInterval(async function()
    {
        let payload = {
            memoryLoad: agent.memoryLoad(),
            cpu: await agent.cpu(),
            memoryUsed: agent.memoryUsed()
        };
        let msg = JSON.stringify(payload);
        await client.publish(name, msg);
        console.log(`${name} ${msg}`);
    }, 1000);

}



