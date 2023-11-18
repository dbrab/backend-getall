const chrome = require('selenium-webdriver/chrome');
const { Builder, By, until } = require('selenium-webdriver');
const { DistrictProjectModel } = require('../models/district-project');
const { DistrictModel } = require("../models/district");
const distritoSplitRule = (text) => {
    const parts = text.split(":");
    const [code, auxCode] = parts[0].split("-");
    const name = parts[1].trim();

    return { code, name }
}
async function datad(req, res){
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
        //aca aparece la lista de departamentos
        const region = await driver.findElement(By.css('input[type="radio"][name="grp1"][value^="01/"]'));
        await region.click();
        await driver.sleep(1000);

        const regiongo = await driver.findElement(By.name('ctl00$CPH1$BtnMunicipalidad'));
        await regiongo.click();
        await driver.sleep(1000);

        //List

        const trElements = await driver.findElements(By.xpath('//tbody/tr[starts-with(@id,"tr")]'));

        for (let tr of trElements) {
            let firstTdInput = await tr.findElement(By.css('td:nth-child(2)'));
            let fullName = await firstTdInput.getText();
            const {name,code}=distritoSplitRule(fullName);
            let lastTd = await tr.findElement(By.xpath('./td[last()]'));
            let lastTdValue = await lastTd.getText();

            const district=await DistrictModel.findOne({name:new RegExp(`^${name}$`, 'i')})
            
            if(!district){
                await DistrictModel.create({
                    name,
                    avance:lastTdValue,code:code
                })
            }else{

                district.name=name;
                district.avance=lastTdValue;
                await district.save();
            }
        }
        //nombre sde los distritos 

        const listof=await DistrictModel.find({});


        console.log(`Retrieving projects `);

        for (let district = 0; district < listof.length; district++) {
            let item = listof[district];
            console.log(`Proyectos para el distrito ${item.name}`)
            let input = await driver.findElement(By.css(`input[aria-label^="${item.name}"]`));
            await input.click();
            await driver.sleep(1000);

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
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
                
                const projectsDistrict=await DistrictProjectModel.findOne({
                    code:item.code,
                    projectname:projectname
                })
                if(!projectsDistrict){
                    await DistrictProjectModel.create({
                        code:item.code,
                        projectname,
                        PIM,
                        CERTIFICACION,
                        PORCENTAJE_AVANCE
                    })

                }else{
                    projectsDistrict.projectname=projectname;
                    projectsDistrict.PIM=PIM;
                    projectsDistrict.CERTIFICACION=CERTIFICACION;
                    projectsDistrict.PORCENTAJE_AVANCE=PORCENTAJE_AVANCE;
                    await projectsDistrict.save()
                }
            }

            // projectsDistrict.sort((a, b) => b.PORCENTAJE_AVANCE - a.PORCENTAJE_AVANCE);




            await driver.navigate().back();
            await driver.sleep(1000);
        }

        await driver.sleep(2000);
        await driver.quit();
        res.status(200).send(`Termino`);

    } catch (error) {
        res.status(400).send(`Fallo ${error.message}`);

        console.error("Error: ", error);
    }
};

module.exports={datad}