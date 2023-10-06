const { MongoClient } = require('mongodb');
const express = require('express');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

const mongoUri = 'mongodb+srv://publicspending:newpassword@gastopublico.sqatsh0.mongodb.net/';
const client = new MongoClient(mongoUri);

client.connect().then(() => {
    console.log("=== MongoDB Connected ===");
}).catch(err => {
    console.error("=== MongoDB connection error ===", err);
});

app.get('/datar', async (req, res) => {
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
        await driver.quit()
        await client.connect();

        const db = client.db('amazonas');
        const collection = db.collection('region');

        await collection.deleteMany({});
        const result = await collection.insertMany(gobiernoRegionalData);

        console.log(`Replaced ${result.insertedCount} documents in the database`);
        console.log(gobiernoRegionalData.length);
        gobiernoRegionalData: gobiernoRegionalData,
        res.json(gobiernoRegionalData)
        await client.close();

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
    }    
});

app.get("/datap", async (req, res) => {
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
        
            const nivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
            await nivelGobiernoRadio.click();
            await driver.sleep(1000);
        
            const sectorButton = await driver.findElement(By.name('ctl00$CPH1$BtnSubTipoGobierno'));
            await sectorButton.click();
            await driver.sleep(1000);
        
            const Municipalidades = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
            await Municipalidades.click();
            await driver.sleep(1000);
        
            const MuniButton = await driver.findElement(By.name('ctl00$CPH1$BtnDepartamento'));
            await MuniButton.click();
            await driver.sleep(1000);
        
            const region = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="01/"]'));
            await region.click();
            await driver.sleep(1000);
        
            const regiongo = await driver.findElement(By.name('ctl00$CPH1$BtnProvincia'));
            await regiongo.click();
            await driver.sleep(1000);
        
            const Data = [];
        
            const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));
        
            for (let tr of trElements) {
              let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
              let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
              let areaName = ariaLabelValue.split(',')[0];
        
              let lastTd = await tr.findElement(By.xpath('./td[last()]'));
              let lastTdValue = await lastTd.getText();
    
              Data.push({ name: areaName, avance: lastTdValue });
            }
    
            Data.sort((a, b) => b.avance - a.avance);
            console.log(Data)
            await driver.quit()

            const client = new MongoClient(mongoUri);
            await client.connect();
    
            const db = client.db('region');
            const collection = db.collection('provincia');
    
            await collection.deleteMany({});
            const result = await collection.insertMany(Data);
    
            console.log(`Replaced ${result.insertedCount} documents in the database`);
                Data: Data
            res.json(Data);
        } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
    }
});

app.get("/datad", async (req, res) => {
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

    const nivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
    await nivelGobiernoRadio.click();
    await driver.sleep(1000);

    const sectorButton = await driver.findElement(By.name('ctl00$CPH1$BtnSubTipoGobierno'));
    await sectorButton.click();
    await driver.sleep(1000);

    const Municipalidades = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
    await Municipalidades.click();
    await driver.sleep(1000);

    const MuniButton = await driver.findElement(By.name('ctl00$CPH1$BtnDepartamento'));
    await MuniButton.click();
    await driver.sleep(1000);

    const region = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="01/"]'));
    await region.click();
    await driver.sleep(1000);

    const regiongo = await driver.findElement(By.name('ctl00$CPH1$BtnMunicipalidad'));
    await regiongo.click();
    await driver.sleep(1000);

    const Datadistricts = [];

    const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));

    for (let tr of trElements) {
      let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
      let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
      let areaName = ariaLabelValue.split(',')[0];

      let lastTd = await tr.findElement(By.xpath('./td[last()]'));
      let lastTdValue = await lastTd.getText();

      Datadistricts.push({ name: areaName, avance: lastTdValue });
    }

    Datadistricts.sort((a, b) => b.avance - a.avance);
    console.log(Datadistricts)
    await driver.quit()

    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('regionamazonas');
    const collection = db.collection('distritos');

    await collection.deleteMany({});
    const result = await collection.insertMany(Datadistricts);

    console.log(`Replaced ${result.insertedCount} documents in the database`);
            Datadistricts: Datadistricts
    res.json(Datadistricts);
} catch (error) {
console.error("Error: ", error);
res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
}
});

app.get('/getdata', async (req, res) => {
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();

        const dbRegion = client.db('amazonas');
        const collectionRegion = dbRegion.collection('region');
        const dataRegion = await collectionRegion.find().toArray();

        const dbProvince = client.db('region');
        const collectionProvince = dbProvince.collection('provincia');
        const dataProvince = await collectionProvince.find().toArray();

        const data = {
            region: dataRegion,
            province: dataProvince
        };

        res.json(data);
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
    }
});
