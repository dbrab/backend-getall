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

            const cn = await driver.findElement(By.name("ctl00$CPH1$BtnProdProy"));
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
