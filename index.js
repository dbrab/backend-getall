const { MongoClient } = require('mongodb');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const app = express();
const cors = require("cors")

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


const datadistricts = [
    { name: 'MUNICIPALIDAD PROVINCIAL DE CHACHAPOYAS', avance: '  24.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE ASUNCION', avance: '  86.1' },
    { name: 'MUNICIPALIDAD DISTRITAL DE BALSAS', avance: '  49.1' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHETO', avance: '  93.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHILIQUIN', avance: '  56.1' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHUQUIBAMBA', avance: '  35.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE GRANADA', avance: '  70.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE HUANCAS', avance: '  68.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LA JALCA', avance: '  72.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LEIMEBAMBA', avance: '  61.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LEVANTO', avance: '  69.1' },
    { name: 'MUNICIPALIDAD DISTRITAL DE MAGDALENA', avance: '  79.9' },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE MARISCAL CASTILLA',
        avance: '  48.2'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE MOLINOPAMPA', avance: '  37.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE MONTEVIDEO', avance: '  61.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE OLLEROS', avance: '  67.7' },
    { name: 'MUNICIPALIDAD DISTRITAL DE QUINJALCA', avance: '  15.4' },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN FRANCISCO DE DAGUAS',
        avance: '  50.2'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN ISIDRO DE MAINO',
        avance: '  64.8'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE SOLOCO', avance: '  66.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE SONCHE', avance: '  73.5' },
    { name: 'MUNICIPALIDAD PROVINCIAL DE BAGUA', avance: '  55.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE ARAMANGO', avance: '  42.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE COPALLIN', avance: '  77.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE EL PARCO', avance: '  31.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE IMAZA', avance: '  49.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LA PECA', avance: '  50.0' },
    {
        name: 'MUNICIPALIDAD PROVINCIAL DE BONGARA - JUMBILLA',
        avance: '  39.6'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHISQUILLA', avance: '  69.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHURUJA', avance: '  58.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE COROSHA', avance: '  70.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CUISPES', avance: '  79.3' },
    { name: 'MUNICIPALIDAD DISTRITAL DE FLORIDA', avance: '  28.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE JAZAN', avance: '  68.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE RECTA', avance: '  67.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE SAN CARLOS', avance: '  87.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE SHIPASBAMBA', avance: '  69.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE VALERA', avance: '  55.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE YAMBRASBAMBA', avance: '  79.6' },
    {
        name: 'MUNICIPALIDAD PROVINCIAL DE CONDORCANQUI - NIEVA',
        avance: '  62.2'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE EL CENEPA', avance: '  55.3' },
    { name: 'MUNICIPALIDAD DISTRITAL DE RIO SANTIAGO', avance: '  52.0' },
    {
        name: 'MUNICIPALIDAD PROVINCIAL DE LUYA - LAMUD',
        avance: '  58.7'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE CAMPORREDONDO',
        avance: '  71.9'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE COCABAMBA', avance: '  80.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE COLCAMAR', avance: '  64.3' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CONILA', avance: '  69.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE INGUILPATA', avance: '  92.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LONGUITA', avance: '  25.1' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LONYA CHICO', avance: '  77.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LUYA', avance: '  66.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LUYA VIEJO', avance: '  71.7' },
    { name: 'MUNICIPALIDAD DISTRITAL DE MARIA', avance: '  87.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE OCALLI', avance: '  47.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE OCUMAL', avance: '  72.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE PISUQUIA', avance: '  76.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE PROVIDENCIA', avance: '  82.7' },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN CRISTOBAL',
        avance: '  70.1'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN FRANCISCO DEL YESO',
        avance: '  78.5'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN JERONIMO DE PACLAS',
        avance: '  75.6'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SAN JUAN DE LOPECANCHA',
        avance: '  72.8'
    },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE SANTA CATALINA',
        avance: '  45.4'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE SANTO TOMAS', avance: '  71.3' },
    { name: 'MUNICIPALIDAD DISTRITAL DE TINGO', avance: '  78.9' },
    { name: 'MUNICIPALIDAD DISTRITAL DE TRITA', avance: '  49.9' },
    {
        name: 'MUNICIPALIDAD PROVINCIAL DE RODRIGUEZ DE MENDOZA - SAN NICOLAS',
        avance: '  42.5'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE CHIRIMOTO', avance: '  81.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE COCHAMAL', avance: '  63.0' },
    { name: 'MUNICIPALIDAD DISTRITAL DE HUAMBO', avance: '  67.7' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LIMABAMBA', avance: '  36.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LONGAR', avance: '  60.3' },
    {
        name: 'MUNICIPALIDAD DISTRITAL DE MARISCAL BENAVIDES',
        avance: '  31.6'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE MILPUC', avance: '  77.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE OMIA', avance: '  60.6' },
    { name: 'MUNICIPALIDAD DISTRITAL DE SANTA ROSA', avance: '  70.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE TOTORA', avance: '  42.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE VISTA ALEGRE', avance: '  68.5' },
    {
        name: 'MUNICIPALIDAD PROVINCIAL DE UTCUBAMBA - BAGUA GRANDE',
        avance: '  58.4'
    },
    { name: 'MUNICIPALIDAD DISTRITAL DE CAJARURO', avance: '  69.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE CUMBA', avance: '  27.4' },
    { name: 'MUNICIPALIDAD DISTRITAL DE EL MILAGRO', avance: '  42.5' },
    { name: 'MUNICIPALIDAD DISTRITAL DE JAMALCA', avance: '  43.8' },
    { name: 'MUNICIPALIDAD DISTRITAL DE LONYA GRANDE', avance: '  53.2' },
    { name: 'MUNICIPALIDAD DISTRITAL DE YAMON', avance: '  70.6' }
];

const data = [
    { name: 'CHACHAPOYAS', avance: '  36.5' },
    { name: 'BAGUA', avance: '  49.5' },
    { name: 'BONGARA', avance: '  58.8' },
    { name: 'CONDORCANQUI', avance: '  57.5' },
    { name: 'LUYA', avance: '  67.4' },
    { name: 'RODRIGUEZ DE MENDOZA', avance: '  49.2' },
    { name: 'UCTUBAMBA', avance: '  54.0' }
];

app.get("/datar", async (req, res) =>
{
    try {
        console.log('Starting web scraping process...');
        const options = new chrome.Options();
        options.headless();

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx');

        // Additional logging statements
        console.log('Navigating to website...');
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

        //List

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

        console.log(gobiernoRegionalData);
        await client.connect();

        const db = client.db('regiones');
        const collection = db.collection('amazonas');

        await collection.deleteMany({});
        const result = await collection.insertMany(gobiernoRegionalData);

        console.log(`Replaced ${result.insertedCount} documents in the database`);

        const input = await driver.findElement(By.css(`input[aria-label^="GOBIERNO REGIONAL DEL DEPARTAMENTO DE AMAZONAS"`));
        await input.click();
        await driver.sleep(1000);

        const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
        await cn.click();
        await driver.sleep(1000);

        const projectsRegion = []
        const datos = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id, "tr")]'));

        for (let tr of datos) {
            let td = await tr.findElement(By.xpath('.//input[@aria-label]'));
            let ariaLabel = await td.getAttribute("aria-label");

            let projectnameMatch = ariaLabel.match(/^(.+),\s+PIA:/);
            let projectname = projectnameMatch ? projectnameMatch[1] : null;

            let PIMMatch = ariaLabel.match(/PIM:\s*(\d+,\d+)/);
            let PIM = PIMMatch ? PIMMatch[1] : null;

            let CERTIFICACIONMatch = ariaLabel.match(/CERTIFICACION:\s*(\d+,\d+)/);
            let CERTIFICACION = CERTIFICACIONMatch ? CERTIFICACIONMatch[1] : null;

            let PORCENTAJE_AVANCEMatch = ariaLabel.match(/PORCENTAJE AVANCE:\s*([\d\.]+)/);
            let PORCENTAJE_AVANCE = PORCENTAJE_AVANCEMatch ? PORCENTAJE_AVANCEMatch[1] : null;

            projectsRegion.push({ projectname, PIM, CERTIFICACION, PORCENTAJE_AVANCE });
        }

        console.log(projectsRegion);
        const db2 = client.db('eachregion');
        const collection2 = db2.collection('eachregiondetail');

        await collection2.deleteMany({});
        const result2 = await collection2.insertMany(projectsRegion);

        console.log(`Replaced ${result2.insertedCount} documents in the database`);

        await driver.sleep(2000);
        await driver.quit();
    } catch (error) {
        console.error("Error: ", error);
    }
} );

app.get("/datap", async (req, res) => {
    try {
        console.log('Starting web scraping process...');
        const options = new chrome.Options();
        options.headless();

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx');

        // Additional logging statements
        console.log('Navigating to website...');
        const inputField = await driver.findElement(By.name('grp1'));
        await inputField.click();
        await driver.sleep(1000);

        const nivelGobiernoButton = await driver.findElement(By.name('ctl00$CPH1$BtnTipoGobierno'));
        await nivelGobiernoButton.click();
        await driver.sleep(1000);

        // Additional logging statements
        console.log('Clicking buttons...');
        const nivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
        await nivelGobiernoRadio.click();
        await driver.sleep(1000);

        const sectorButton = await driver.findElement(By.name('ctl00$CPH1$BtnSubTipoGobierno'));
        await sectorButton.click();
        await driver.sleep(1000);

        // Additional logging statements
        console.log('Selecting options...');
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

        const listofprovinces = [];
        const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));

        for (let tr of trElements) {
            let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
            let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
            let areaName = ariaLabelValue.split(',')[0];

            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();

            listofprovinces.push({ name: areaName, avance: lastTdValue });
        }
        console.log(listofprovinces);
        console.log("Retrieving projects");

        for (let province = 0; province < data.length; province++) {
            let item = data[province];

            let input = await driver.findElement(By.css(`input[aria-label^="${item.name}"]`));
            await input.click();
            await driver.sleep(1000);

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnFuncion"));
            await cn.click();
            await driver.sleep(1000);
            const datos = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id, "tr")]'));

            const projectsProvince = [];
            for (let tr of datos) {
                let td = await tr.findElement(By.xpath('.//input[@aria-label]'));
                let ariaLabel = await td.getAttribute("aria-label");

                let projectnameMatch = ariaLabel.match(/^(.+),\s+PIA:/);
                let projectname = projectnameMatch ? projectnameMatch[1] : null;

                let PIMMatch = ariaLabel.match(/PIM:\s*(\d+,\d+)/);
                let PIM = PIMMatch ? PIMMatch[1] : null;

                let CERTIFICACIONMatch = ariaLabel.match(/CERTIFICACION:\s*(\d+,\d+)/);
                let CERTIFICACION = CERTIFICACIONMatch ? CERTIFICACIONMatch[1] : null;

                let PORCENTAJE_AVANCEMatch = ariaLabel.match(/PORCENTAJE AVANCE:\s*([\d\.]+)/);
                let PORCENTAJE_AVANCE = PORCENTAJE_AVANCEMatch ? PORCENTAJE_AVANCEMatch[1] : null;

                projectsProvince.push({ projectname, PIM, CERTIFICACION, PORCENTAJE_AVANCE });
            }

            projectsProvince.sort((a, b) => b.PORCENTAJE_AVANCE - a.PORCENTAJE_AVANCE);

            const db2 = client.db(`eachprovince${province + 1}`);
            const collection2 = db2.collection(`eachprovincedetail${province + 1}`);

            await collection2.deleteMany({});
            const result2 = await collection2.insertMany(projectsProvince);

            console.log(projectsProvince);
            await driver.navigate().back();
            await driver.sleep(1000);
        }
        await driver.sleep(2000);
        await driver.quit();
    } catch (error) {
        console.error("Error: ", error);
    }
});  


app.get("/datap", async (req, res) => 
{
    try {

        //List

        const listofprovinces = [];
        const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));

        for (let tr of trElements) {
            let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
            let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
            let areaName = ariaLabelValue.split(',')[0];

            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();

            listofprovinces.push({ name: areaName, avance: lastTdValue });
        }
        console.log(listofprovinces);

        for (let tr of trElements) {
            let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
            let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
            let areaName = ariaLabelValue.split(',')[0];

            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();

            listofprovinces.push({ name: areaName, avance: lastTdValue });
        }
        console.log(listofprovinces);

        await client.connect();

        const db = client.db('provincias');
        const collection = db.collection('proyectos');

        await collection.deleteMany({});
        const result = await collection.insertMany(listofprovinces);

        console.log(`Retrieving`);

        console.log("Retrieving projects");

        await driver.sleep(1000)
        console.log("Retrieving projects");
        const projectsProvince = [];

        for (let province = 0; province < data.length; province++) {
            let item = data[district];

            let input = await driver.findElement(By.css(`input[aria-label^="${item.name}"]`));
            await input.click();
            await driver.sleep(1000);

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
            await cn.click();
            await driver.sleep(1000);
            const datos = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id, "tr")]'));

            const projectsDistrict = [];
            for (let tr of datos) {

                projectsProvince.push({ projectname, PIM, CERTIFICACION, PORCENTAJE_AVANCE });
            }

            projectsProvince.sort((a, b) => b.PORCENTAJE_AVANCE - a.PORCENTAJE_AVANCE);

            const db2 = client.db(`eachprovince${province + 1}`);
            const collection2 = db2.collection(`eachprovincedetail${province + 1}`);

            await collection2.deleteMany({});
            const result2 = await collection2.insertMany(projectsProvince);

            console.log(projectsProvince);
            await driver.navigate().back();
            await driver.sleep(1000);
        }



        await driver.sleep(2000);
        await driver.quit();
    } catch (error) {
        console.error("Error: ", error);
    }
}
)

app.get("/datad", async (req, res) => {
    try {
        console.log('Starting web scraping process...');
        const options = new chrome.Options();
        options.headless();

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx');

        // Additional logging statements
        console.log('Navigating to website...');
        const inputField = await driver.findElement(By.name('grp1'));
        await inputField.click();
        await driver.sleep(1000);

        const nivelGobiernoButton = await driver.findElement(By.name('ctl00$CPH1$BtnTipoGobierno'));
        await nivelGobiernoButton.click();
        await driver.sleep(1000);

        // Additional logging statements
        console.log('Clicking buttons...');
        const nivelGobiernoRadio = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="M/"]'));
        await nivelGobiernoRadio.click();
        await driver.sleep(1000);

        const sectorButton = await driver.findElement(By.name('ctl00$CPH1$BtnSubTipoGobierno'));
        await sectorButton.click();
        await driver.sleep(1000);

        // Additional logging statements
        console.log('Selecting options...');
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

        //List

        const listof = [];
        const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));

        for (let tr of trElements) {
            let firstTdInput = await tr.findElement(By.xpath('./td[1]/input'));
            let ariaLabelValue = await firstTdInput.getAttribute('aria-label');
            let areaName = ariaLabelValue.split(',')[0];

            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();

            listof.push({ name: areaName, avance: lastTdValue });
        }
        console.log(listof);

        await client.connect();

        const db = client.db('distritos');
        const collection = db.collection('avances');

        await collection.deleteMany({});
        const result = await collection.insertMany(listof);

        console.log(`Replaced ${result.insertedCount} documents in the database`);

        console.log("Retrieving projects");

        for (let district = 0; district < datadistricts.length; district++) {
            let item = datadistricts[district];

            let input = await driver.findElement(By.css(`input[aria-label^="${item.name}"]`));
            await input.click();
            await driver.sleep(1000);

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
            await cn.click();
            await driver.sleep(1000);
            const datos = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id, "tr")]'));

            const projectsDistrict = [];
            for (let tr of datos) {
                let td = await tr.findElement(By.xpath('.//input[@aria-label]'));
                let ariaLabel = await td.getAttribute("aria-label");

                let projectnameMatch = ariaLabel.match(/^(.+),\s+PIA:/);
                let projectname = projectnameMatch ? projectnameMatch[1] : null;

                let PIMMatch = ariaLabel.match(/PIM:\s*(\d+,\d+)/);
                let PIM = PIMMatch ? PIMMatch[1] : null;

                let CERTIFICACIONMatch = ariaLabel.match(/CERTIFICACION:\s*(\d+,\d+)/);
                let CERTIFICACION = CERTIFICACIONMatch ? CERTIFICACIONMatch[1] : null;

                let PORCENTAJE_AVANCEMatch = ariaLabel.match(/PORCENTAJE AVANCE:\s*([\d\.]+)/);
                let PORCENTAJE_AVANCE = PORCENTAJE_AVANCEMatch ? PORCENTAJE_AVANCEMatch[1] : null;

                projectsDistrict.push({ projectname, PIM, CERTIFICACION, PORCENTAJE_AVANCE });
            }

            projectsDistrict.sort((a, b) => b.PORCENTAJE_AVANCE - a.PORCENTAJE_AVANCE);

            const db2 = client.db(`eachdistrict${district + 1}`);
            const collection2 = db2.collection(`eachdistrictdetail${district + 1}`);

            await collection2.deleteMany({});
            const result2 = await collection2.insertMany(projectsDistrict);

            console.log(projectsDistrict);
            await driver.navigate().back();
            await driver.sleep(1000);
        }

        await driver.sleep(2000);
        await client.close();
        await driver.quit();
    } catch (error) {
        console.error("Error: ", error);
    }
});
