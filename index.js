const { MongoClient } = require('mongodb');
const express = require('express');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cors = require('cors');
require('chromedriver');

const app = express();
app.use(cors());

const mongoUri = 'mongodb+srv://publicspending:newpassword@gastopublico.sqatsh0.mongodb.net/';
const client = new MongoClient(mongoUri);

client.connect().then(() => {
    console.log("=== MongoDB Connected ===");
}).catch(err => {
    console.error("=== MongoDB connection error ===", err);
});


app.get('/data', async (req, res) => {
    try {
        const options = new chrome.Options();
        options.headless();

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx');

        const inputField = await driver.findElement(By.name('grp1'));
        await inputField.click();
        await driver.sleep(1000);

        const nivelGobiernoButton = await driver.findElement(By.name('ctl00$CPH1$BtnTipoGobierno'));
        await nivelGobiernoButton.click();
        await driver.sleep(1000);

        const nivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="R/"]'));
        await nivelGobiernoRadio.click();
        await driver.sleep(1000);

        const sectorButton = await driver.findElement(By.name('ctl00$CPH1$BtnSector'));
        await sectorButton.click();
        await driver.sleep(1000);

        const secondNivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="99/"]'));
        await secondNivelGobiernoRadio.click();
        await driver.sleep(1000);

        const pliegoButton = await driver.findElement(By.name('ctl00$CPH1$BtnPliego'));
        await pliegoButton.click();

        await driver.sleep(1000); 

        const gobiernoRegionalData = [];
        for (let i = 0; i < 26; i++) {
            const regionalNameSelector = `#tr${i} td[align="left"]`;
            const avancePercentageSelector = `#tr${i} td:last-child`;
  
            const regionalNameElement = await driver.findElement(By.css(regionalNameSelector));
            const avancePercentageElement = await driver.findElement(By.css(avancePercentageSelector));
  
            const regionalName = await regionalNameElement.getText();
            const avancePercentage = parseFloat(await avancePercentageElement.getText());
            const modifiedName = regionalName.replace(/^: GOBIERNO REGIONAL DEL DEPARTAMENTO DE\s+/i, '');
  
              gobiernoRegionalData.push({ name: modifiedName, avance: avancePercentage });
        }
        gobiernoRegionalData.sort((a, b) => b.avance - a.avance);
        console.log(gobiernoRegionalData);

        const mongoURI = 'mongodb+srv://publicspending:newpassword@gastopublico.sqatsh0.mongodb.net/';

        const client = new MongoClient(mongoUri);
        await client.connect();

        const db = client.db('amazonas');
        const collection = db.collection('region');

        await collection.deleteMany({});
        const result = await collection.insertMany(gobiernoRegionalData);

        console.log(`Replaced ${result.insertedCount} documents in the database`);

        await client.close();

        res.json(gobiernoRegionalData);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
    }    
});
