const chrome = require('selenium-webdriver/chrome');
const { Builder, By, until } = require('selenium-webdriver');
const { RegionProjectModel } = require('../models/region-project');
const { RegionModel } = require("../models/region");

async function datar(req, res) {
    try {
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

        for (let i = 0; i < 26; i++) {
            const regionalNameSelector = `#tr${i} td[align="left"]`;
            const avancePercentageSelector = `#tr${i} td:last-child`;

            const regionalNameElement = await driver.findElement(By.css(regionalNameSelector));
            const avancePercentageElement = await driver.findElement(By.css(avancePercentageSelector));

            const regionalName = await regionalNameElement.getText();
            const avancePercentage = parseFloat(await avancePercentageElement.getText());
            const modifiedName = regionalName.split("DEPARTAMENTO DE");
            let sp = ''
            if (modifiedName.length === 2) {
                sp = modifiedName[1].trim()
            } else {
                let isLima = modifiedName.find((it) => {
                    return it.trim() === "LIMA"
                })
                sp = "LIMA";
                let isCallao = modifiedName.find((it) => {
                    return it.trim() === "CALLAO"
                })
                sp = "CALLAO";
                if (!isCallao || !isLima) {
                    continue;
                }
            }
            const region = await RegionModel.findOne({ name: new RegExp(`^${sp}$`, 'i') });

            if (!region) {
                continue
            }


            region.name = sp;
            region.avance = avancePercentage;
            await region.save()
        }






        const amazonasRegion = await RegionModel.findOne({ name: new RegExp(`^AMAZONAS$`, 'i') });
        const input = await driver.findElement(By.css(`input[aria-label^="GOBIERNO REGIONAL DEL DEPARTAMENTO DE AMAZONAS"`));
        await input.click();
        await driver.sleep(1000);

        const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
        await cn.click();
        await driver.sleep(1000);

        const datos = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id, "tr")]'));

        console.log(`Proyectos para la region AMAZONAS`)

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

            let regionProject = await RegionProjectModel.findOne({ name: new RegExp(`^${projectname}$`, 'i') });
            if (!regionProject) {

                regionProject = await RegionProjectModel.create({
                    code: amazonasRegion.code, projectname, PIM, CERTIFICACION, PORCENTAJE_AVANCE
                })
            } else {
                regionProject.code = amazonasRegion.code;
                regionProject.projectname = projectname,
                    regionProject.PIM = PIM;
                regionProject.CERTIFICACION = CERTIFICACION;
                regionProject.PORCENTAJE_AVANCE = PORCENTAJE_AVANCE;

                await regionProject.save();
            }

            // console.log(amazonasRegion.code,{ regionProject });
        }


        // console.log(`Replaced ${result2.insertedCount} documents in the database`);

        await driver.sleep(2000);
        await driver.quit();
        res.status(200).send("Terminado")
    } catch (error) {
        res.status(400).send(`${error.message}`)

        console.error("Error: ", error);
    }
}

module.exports = { datar }