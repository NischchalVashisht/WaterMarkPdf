import { LightningElement, api,wire } from "lwc";
import pdflib from "@salesforce/resourceUrl/pdflib";
import { loadScript } from "lightning/platformResourceLoader";
import getData from '@salesforce/apex/DocData.getData';


export default class Watermark extends LightningElement {

    @api recordId
    docData = []
    error
    ids ='' 
    firstCall =true
  
    renderedCallback() {
        
        
        if(this.firstCall){
            loadScript(this, pdflib).then(() => {
            });

            console.log('recode ud  ' + this.recordId)
            if (this.recordId) {
                getData({ accountId: this.recordId })
                    .then((result) => {
                        this.docData = JSON.parse(JSON.stringify(result));
                        console.log('Size of File are ' + this.docData.length)
                        this.error = undefined;
                        this.watermark()
                    })
                    .catch((error) => {
                        console.log('error while calling ' + error)
                    })
                 }
            }
    }

    async watermark(){
        var tempBytes = '';
        console.log('tempBytes', tempBytes)

        if (this.docData.length > 0) {
            for (let i = 0; i < this.docData.length; i++) {
                tempBytes = Uint8Array.from(atob(this.docData[i]), (c) => c.charCodeAt(0));
                console.log('tempBtes>> ', tempBytes)
                const usConstitutionPdf = await PDFLib.PDFDocument.load(tempBytes);
                const helveticaFont = await usConstitutionPdf.embedFont(await PDFLib.StandardFonts.Helvetica)
                const rgb = await PDFLib.rgb
                const degrees = await PDFLib.degrees
                console.log('After ', usConstitutionPdf, usConstitutionPdf.getPages())
                const pages = usConstitutionPdf.getPages();
                pages.forEach((firstPage)=>{
                    const { width, height } = firstPage.getSize()
                    firstPage.drawText('This text was added with JavaScript!', {
                     x: 5,
                     y: height / 2 + 300,
                     size: 50,
                     color: rgb(0.9, 0.2, 0.1),
                     rotate: degrees(-45),
                })

                })
                
            const pdfBytes = await usConstitutionPdf.save()
            this.saveByteArray("My PDF", pdfBytes);
            }

        }
        
    }

    saveByteArray(pdfName, byte) {
        var blob = new Blob([byte], { type: "application/pdf" });
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        var fileName = pdfName;
        link.download = fileName;
        link.click();
    }


}