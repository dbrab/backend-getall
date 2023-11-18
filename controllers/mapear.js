const { DistrictModel } = require("../models/district");
const { ProvinceModel } = require("../models/province");
const { RegionModel } = require("../models/region");
const chrome = require('selenium-webdriver/chrome');
const { Builder, By, until } = require('selenium-webdriver');

const splitRuleProvince = (text) => {
    const parts = text.split(":");
    const code = parts[0];
    const name = parts[1].trim();
    return { code, name };
}
const splitRuleDepartamento = (text) => {
    const parts = text.split(":");
    const [code, auxCode] = parts[0].split("-");
    const name = parts[1].trim();

    return { code, name }
}
const distritoSplitRule = (text) => {
    const parts = text.split(":");
    const [code, auxCode] = parts[0].split("-");
    const name = parts[1].trim();

    return { code, name }
}
//puede ser provincia,distrito,regiones,etc
const getRowData = async (driver, splitRule, full = true) => {
    const entities = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));
    const listOfEntities = [];

    //ctl00_CPH1_RptHistory_ctl05_TD0 vuelevs a todas las end

    for (let tr of entities) {
        let firstTdInput = await tr.findElement(By.css('td:nth-child(2)'));
        let fullName = await firstTdInput.getText();
  
        // let splits = fullName.split(':');
        // const id=splits[0];
        // const name=splits[1].trim();
        const { code, name } = splitRule(fullName);
        listOfEntities.push({ code: code, name: name });
    }
    return [listOfEntities, entities]

}

const navigateToProvinceId = async (driver, index) => {
    const entities = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));
    const tr = entities[index];
    const select = await tr.findElement(By.css('td:nth-child(1)'));

    await select.click();
    await driver.sleep(1000);
    let selectMuni = await driver.findElement(By.name("ctl00$CPH1$BtnMunicipalidad"));
    await selectMuni.click();
    await driver.sleep(1000);
}
const backToProvince = async (driver, index) => {
    const back = await driver.findElement(By.id("ctl00_CPH1_RptHistory_ctl05_TD0"))

    await back.click()
    await driver.sleep(2000);
};

async function mapear(req, res) {
    try {
        const options = new chrome.Options();
        options.headless();

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx');


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

        console.log("Se elegiira departamento")
        const MuniButton = await driver.findElement(By.name('ctl00$CPH1$BtnDepartamento'));
        await MuniButton.click();
        await driver.sleep(1000);
        //elegimos amazonas
        console.log("Estamos en departamento, asi que lo mapeamos");

        const [listDepartamentos, departamentos] = await getRowData(driver, splitRuleDepartamento, false)

        //primero eliminamos en caso de alguna desincronziacion
        await RegionModel.deleteMany({});
        //insertamos los nuevos
        await RegionModel.insertMany(listDepartamentos);

        const region = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="01/"]'));
        await region.click();
        await driver.sleep(1000);

        const regiongo = await driver.findElement(By.name('ctl00$CPH1$BtnProvincia'));
        await regiongo.click();
        await driver.sleep(1000);
        //amazonas es 01
        //hasta aqui estamos en amazonas, ahora mapareamos todos las provincias y sus distritos

        const [listProvincias, provincias] = await getRowData(driver, splitRuleProvince, false)

        //primero eliminamos en caso de alguna desincronziacion ,todo lo de aqui es solo de amazonas
        await ProvinceModel.deleteMany({});
        //insertamos los nuevos
        await ProvinceModel.insertMany(listProvincias);
        //guardar
        await DistrictModel.deleteMany({});
        console.log(`Maparemos distritos`)
        for (let i = 0; i < listProvincias.length; i++) {
            await navigateToProvinceId(driver, i);
            //aqui ya estamos en distrtitos, y hacemos lo mismo
            const [listDistritos, distritos] = await getRowData(driver, distritoSplitRule);
            await DistrictModel.insertMany(listDistritos);

            //aqui volvvemos atras para obtener la data de otro distrito
            await backToProvince(driver);
        }
        await driver.sleep(2000);
        await driver.quit();
        res.status(200).send("Sincroniziaciion terminada")

    } catch (e) {
        res.status(400).send(`Sincroniziaciion fallo ${e.message}` )

        console.log("error", e.message)
    }
};

module.exports = { mapear }