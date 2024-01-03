/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    // Set default value
    if (typeof settings.layoutIndex === 'undefined') {
        settings.layoutIndex = "0";
        $PI.setSettings(settings);
    }

    // Inject form values
    Utils.setFormValue(settings, form);
    // Updated settings when form values change
    form.addEventListener(
        'input',
        Utils.debounce(150, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );
});

$PI.onDidReceiveGlobalSettings(({payload}) => {
    console.log('onDidReceiveGlobalSettings', payload);
})
