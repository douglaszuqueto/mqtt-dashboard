(function () {

  const defaultSettings = {
    broker  : 'broker.iot-br.com',
    port    : 8880,
    username: null,
    password: null,
    clientId: "DZ",
    isSSL   : false
  };

  const connectionStatus = document.getElementById('connectionStatus');

  const brokerInput   = document.getElementById('broker');
  const portInput     = document.getElementById('port');
  const clientIdInput = document.getElementById('clientId');
  const isSSLInput    = document.getElementById('isSSL');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const saveButton       = document.getElementById('save');
  const connectButton    = document.getElementById('connect');
  const disconnectButton = document.getElementById('disconnect');

  const subscribeButton     = document.getElementById('subscribe');
  const unsubscribeButton   = document.getElementsByClassName('unsubscribe');
  const subscribeTopicInput = document.getElementById('subscribeTopic');

  const publishButton       = document.getElementById('publish');
  const publishMessageInput = document.getElementById('publishMessage');
  const publishTopicInput   = document.getElementById('publishTopic');

  const messagesTbody = document.getElementById('messages');

  const loadSettings = () => {
    if ( !JSON.parse(localStorage.getItem('mqtt')) ) {
      return;
    }

    let json = JSON.parse(localStorage.getItem('mqtt'));

    defaultSettings.broker   = json.broker;
    defaultSettings.port     = json.port;
    defaultSettings.username = json.username;
    defaultSettings.password = json.password;
    defaultSettings.clientId = json.clientId;
    defaultSettings.isSSL    = json.isSSL;
  };

  loadSettings();

  const mqttOptions = {
    host    : defaultSettings.broker,
    port    : parseInt(defaultSettings.port),
    clientId: defaultSettings.clientId + String(Date.now())
  };

  const onConnectionLost = (responseObject) => {
    return console.log(`Status: ${responseObject.errorMessage}`);
  };

  const onMessageArrived = (message) => {
    var msg = message.payloadString;
    console.log(msg);

    var messages = '<tr><td>' + message.destinationName + '</td><td>' + msg + '</td></tr>';

    let element = document.createElement(messages);
    messagesTbody.appendChild(element);

  };

  let mqtt              = new Paho.MQTT.Client(mqttOptions.host, mqttOptions.port, mqttOptions.clientId);
  mqtt.onConnectionLost = onConnectionLost;
  mqtt.onMessageArrived = onMessageArrived;

  const onSuccess = () => {
    var msg = 'Conexão efetuada com sucesso';

    console.log(msg);
    Materialize.toast(msg, 2000);

    connectButton.setAttribute('disabled', 'true');
    disconnectButton.removeAttribute('disabled');
    subscribeButton.removeAttribute('disabled');
    publishButton.removeAttribute('disabled');

    connectionStatus.classList.add('green-text');

  };

  const onFailure = (message) => {
    console.log("Connection failed: " + message.errorMessage);

    connectButton.removeAttribute('disabled');
    disconnectButton.setAttribute('disabled', 'true');
  };

  const mqttConnect = () => {

    var options = {
      timeout  : 3,
      onSuccess: onSuccess,
      onFailure: onFailure,
      // useSSL   : defaultSettings.isSSL
    };

    mqtt.connect(options)

  };

  const mqttDisconnect = () => {
    mqtt.disconnect();

    connectButton.removeAttribute('disabled');
    disconnectButton.setAttribute('disabled', 'true');
    subscribeButton.setAttribute('disabled', 'true');
    publishButton.setAttribute('disabled', 'true');

    connectionStatus.classList.remove('green-text');

    Materialize.toast('Desconectado do broker mqtt', 2000);
  };

  const loadForm = () => {
    brokerInput.value   = defaultSettings.broker;
    portInput.value     = defaultSettings.port;
    usernameInput.value = defaultSettings.username;
    passwordInput.value = defaultSettings.password;
    clientIdInput.value = defaultSettings.clientId;
    isSSLInput.setAttribute('checked', defaultSettings.isSSL);

  };

  const save = () => {
    localStorage.setItem("mqtt", JSON.stringify({
      broker  : brokerInput.value,
      port    : portInput.value,
      clientId: clientIdInput.value,
      isSSL   : isSSLInput.value,
      username: usernameInput.value,
      password: passwordInput.value
    }));

    Materialize.toast('Configurações salvas com successo', 2000);

    return false;
  };

  const createMessage = (topic, message) => {
    var publisher             = new Paho.MQTT.Message(message);
    publisher.destinationName = topic;
    mqtt.send(publisher);
  };

  const publish = () => {
    let topic, message;
    topic   = publishTopicInput.value;
    message = publishMessageInput.value;

    createMessage(topic, message);
  };

  const subscribe = () => {
    var $topic = $('#subscribeTopic');

    mqtt.subscribe(subscribeTopicInput.value);

    $subscribes = $('#subcribes');

    var id = (subscribeTopicInput.value).replace('/', '-');

    var table = '<tr id="' + id + '">';
    table += '<td>' + subscribeTopicInput.value + '</td>';
    table += '<td>';
    table += '<a class="unsubscribe" data-id="' + id + '" data-topic="' + subscribeTopicInput.value + '">';
    table += '<i class="material-icons red-text">delete</i>';
    table += '</a>';
    table += '</td>';
    table += '</tr>';

    $subscribes.append(table);

    subscribeTopicInput.value = '';
    unsubscribeReload();
  };

  const unsubscribe = () => {
    // var topic = this.attribute('topic');
    // var id    = this.attribute('data-id');

    console.log(this);

    // mqtt.unsubscribe(topic);
    // $('#' + id).remove();

    // return false;
  };


  loadForm();
  $('select').material_select();

  saveButton.addEventListener('click', save);
  connectButton.addEventListener('click', mqttConnect);
  disconnectButton.addEventListener('click', mqttDisconnect);

  publishButton.addEventListener('click', publish);
  subscribeButton.addEventListener('click', subscribe);

  const unsubscribeReload = () => {
    Array.from(unsubscribeButton).forEach((element) => {
      element.addEventListener('click', unsubscribe);
    });
  };

})();
