const brain = require('brain.js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function ask(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}
async function ai() {
    const net = new brain.NeuralNetwork();
    while (1) {
        var x = await ask("Input");
        var y = await ask("Output");
        await net.train([
        { input: [x], output: [y] },
        ]);
        var keep = await ask("Keep Going?");
        if (keep === "no") break;
    }
    var input = await ask("Input");
    const output = net.run([input]);
    console.log(output);
}
ai();