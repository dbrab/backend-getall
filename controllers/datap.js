const chrome = require('selenium-webdriver/chrome');
const { Builder, By, until } = require('selenium-webdriver');
const { DistrictProjectModel } = require('../models/district-project');
const { ProvinceModel } = require("../models/province");
const { ProvinceProjectModel } = require('../models/province-project');

const splitRuleProvince = (text) => {
    const parts = text.split(":");
    const code = parts[0];
    const name = parts[1].trim();
    return { code, name };
}
async function datap(req, res) {
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
            let firstTdInput = await tr.findElement(By.css('td:nth-child(2)'));
            let fullName = await firstTdInput.getText();
            const {name,code}=splitRuleProvince(fullName);

            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();



            const province=await ProvinceModel.findOne({name:new RegExp(`^${name}$`, 'i')})
            if(!province){
                await DistrictModel.create({
                    name,
                    avance:lastTdValue,code:code
                })
            }else{

                province.name=name;
                province.avance=lastTdValue;
                await province.save();
            }

        }
        console.log("Retrieving projects");
        const data=await ProvinceModel.find({});
        for (let province = 0; province < data.length; province++) {
            let item = data[province];
            console.log(`Proyectos para la provincia ${item.name}`)

            let input = await driver.findElement(By.css(`input[aria-label^="${item.name}"]`));
            await input.click();
            await driver.sleep(1000);

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnFuncion"));
            await cn.click();
            await driver.sleep(1000);
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
                
                const project=await ProvinceProjectModel.findOne({
                    projectname:projectname,
                    code:item.code
                })
                if(!project){
                    await ProvinceProjectModel.create({
                        code:item.code,
                        projectname,
                        PIM,
                        CERTIFICACION,
                        PORCENTAJE_AVANCE
                    })

                }else{
                    project.projectname=projectname;
                    project.PIM=PIM;
                    project.CERTIFICACION=CERTIFICACION;
                    project.PORCENTAJE_AVANCE=PORCENTAJE_AVANCE;
                    await project.save()
                }
            }



            await driver.navigate().back();
            await driver.sleep(1000);
        }
        await driver.sleep(2000);
        await driver.quit();

        res.status(200).send("Terminado");
    } catch (error) {
        res.status(400).send(`Fallo ${error.message}`);

        console.error("Error: ", error);
    }
};


module.exports = { datap }

