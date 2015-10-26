{!REQUIRESCRIPT("/soap/ajax/18.0/connection.js")}
{!REQUIRESCRIPT("/soap/ajax/18.0/apex.js")}



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
var result = sforce.connection.query("SELECT Id,pymt__Processor_Id__c FROM pymt__Processor_Connection__c WHERE pymt__Default_Connection__c = true ");
var records = result.getArray("records");

try{
var pmt = new sforce.SObject("pymt__PaymentX__c");
pmt.Name = "Payment";
pmt.pymt__Contact__c = contactId;
pmt.pymt__Status__c = "In Process";
pmt.pymt__Date__c = new Date();
pmt.pymt__Transaction_Type__c = "Payment";
pmt.pymt__Payment_Processor__c = records[0].pymt__Processor_Id__c;
pmt.pymt__Processor_Connection__c = records[0].Id;
pmt.pymt__Amount__c = '{!Text(Invoice__c.Balance_Due__c)}';
pmt.Invoice__c = '{!Invoice__c.Id}';
pmt.Financial_Account__c = '{!Invoice__c.Financial_AccountId__c}';
pmt.pymt__Currency_ISO_Code__c = "USD";
var result = sforce.connection.create([pmt]);
if(result[0].getBoolean("success")){
var cancelURL = escape("/{!Invoice__c.Id}");
var finishURL = escape("/{!Invoice__c.Id}");
window.location = "/community/pymt__PtlCheckout?pid="+result[0].id+"&rpm=1&cancelURL="+cancelURL+"&finishURL="+finishURL;
}else{
alert('Could not create payment. Please contact customer service' + result);
}

}catch(error){
alert('Exception Name: '+error.name+ 'Exception Message:' + error.message);
}

}

validate();
