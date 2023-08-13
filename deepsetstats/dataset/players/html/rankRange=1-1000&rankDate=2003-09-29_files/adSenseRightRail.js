define(["vue"], (Vue) => {
    let AdSense;
    return AdSense = (() => {
        const AdSense = Vue.component("ads", {
            props: {
                "newsAd": String,
                "scoresAd": String,
                "isScoresTab": String,
                "isTour": Boolean
            },

            template:
                `
                    <div  class="iab-wrapper">
                        <div class="adtech-wrapper">
                            <div v-bind:id="'div-gpt-ad-'+ this.adUnitValue"></div>
                        </div>
                    </div>
                `,

            computed: {
                adUnitValue: function () {
                    return this.isScoresTab =="true" ? this.scoresAd : this.newsAd;
                }
            },

            mounted: function(){
                this.initAd();
            },


            methods:{
                initAd: function(){
                    let timeout = 200;
                    let adUnit = 'div-gpt-ad-'+ this.adUnitValue;

                    if(this.timeout) timeout = this.timeout;
                    this.googleInit = setTimeout(() => {
                        googletag.cmd.push(function () { googletag.display(adUnit); });
                    }, timeout);
                },
            }
        });

        return AdSense;
    })();
});
