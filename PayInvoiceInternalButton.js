{!REQUIRESCRIPT("/soap/ajax/27.0/connection.js")}
{!REQUIRESCRIPT("/soap/ajax/27.0/apex.js")}



function validate (){
try{
if('{!Text(Invoice__c.Balance_Due__c)}' <= 0){
alert('This invoice has already been paid in full.');
return;
}

var result = sforce.connection.query("SELECT Id,Account_Holder__c FROM Financial_Account__c WHERE Id = '{!Invoice__c.Financial_AccountId__c}' ");
var records = result.getArray("records");
var acctId = records[0].Account_Holder__c;

var result = sforce.connection.query("SELECT Id,PersonContactId FROM Account WHERE Id = '"+acctId+"' ");
var records = result.getArray("records");
if (records.length == 0 || records[0].PersonContactId == ''){
alert('To pay this Invoice the account holder on the Financial Account must be an individual');
return;
}
if(records.length != 0){
createPayment(records[0].PersonContactId);
}
}catch(error){
alert('Exception Name: '+error.name+ 'Exception Message:' + error.message);
}
}

function createPayment(contactId){

var cancelURL = escape("/{!Invoice__c.Id}");
var finishURL = escape("/{!Invoice__c.Id}");
window.location = "/apex/pymt__PaymentTerminal?csid={!Invoice__c.Id}&cid="+contactId+"&cancelURL="+cancelURL+"&finishURL="+finishURL;


}

validate();
