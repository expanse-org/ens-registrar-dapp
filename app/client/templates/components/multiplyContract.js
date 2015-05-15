/**
Template Controllers

@module Templates
*/

/**
The multiply contract template

@class [template] components_multiplyContract
@constructor
*/

// solidity source code
var source = "" + 
"contract test {\n" +
"   function multiply(uint a) returns(uint d) {\n" +
"       return a * 7;\n" +
"   }\n" +
"}\n";

// contract hex code
var code = "605280600c6000396000f3006000357c010000000000000000000000000000000000000000000000000000000090048063c6888fa114602e57005b60376004356041565b8060005260206000f35b6000600782029050604d565b91905056";

// contract description, this will be autogenerated somehow
var desc =  [{
    "name": "multiply(uint256)",
    "type": "function",
    "inputs": [
    {
        "name": "a",
        "type": "uint256"
    }
    ],
    "outputs": [
    {
        "name": "d",
        "type": "uint256"
    }
    ]
}];

// Construct Multiply Contract Object and contract instance
var MultiplyContract = web3.eth.contract(desc),
    watch = web3.eth.filter('latest'),
    contractMined = false,
	contract;

// Set coinbase as the default account
web3.eth.defaultAccount = web3.eth.coinbase;

Template['components_multiplyContract'].helpers({

	/**
	Get multiply contract source code.
	
	@method (source)
	*/

	'source': function(){
		return source;
	},
});

Template['components_multiplyContract'].events({

	/**
	On "Create New Contract" click
	
	@event click .btn-default
	*/

	"click .btn-default": function(event, template){ // Create Contract
        MultiplyContract.new({data: code, gas: 1900000}, function(err, contractInstance){
            if(err) {
                Session.set('multiplyResult', 'Error transacting contract: ' + String(err));
                return;
            }                
            
            contract = contractInstance;
            Session.set('address', contract.address);
            Session.set('multiplyResult', 'Mining contract, please wait.');
            
            watch.watch(function (err, hash) {
                var block = web3.eth.getBlock(hash, true); 
                contractMined = block.transactions.reduce(function (mined, th) {
                    // TODO: compiled code do not have 0x prefix
                    return mined || (th.from === web3.eth.defaultAccount && th.input.indexOf(code) !== -1);
                }, false);
                
                if (contractMined)
                    Session.set('multiplyResult', 'Contract successfully mined!');
            });
        });
	},

	/**
	On Multiply Number Input keyup
	
	@event keyup .form-control
	*/

	"keyup .form-control": function(event, template){ // Call Contract
		var value = template.find("#multiplyNum").value;        
		contract.multiply.call(value, function(err, result){            
            Session.set('multiplyValue', String(value));
            Session.set('multiplyResult', String(result));
            
            if(err)
                Session.set('multiplyResult', String(err));
        }); // Call Contract and Multply Given Value
	},
});