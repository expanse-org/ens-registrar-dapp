import { ens, registrar, network } from '/imports/lib/ethereum';
import Helpers from '/imports/lib/helpers/helperFunctions';

let publicAddrResolver;

function getPublicAddrResolver() {
  let address;
  switch(network) {
    case 'ropsten': address = '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a'; break;
    case 'main': address = '0x0F02bd3aC5856D8D08deE70DeC5B4Ad7768DdCcE'; break;
    default: return null;
  }
  if (!publicAddrResolver) {
    publicAddrResolver = web3.eth.contract([{"constant":true,"inputs":[{"name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentTypes","type":"uint256"}],"name":"ABI","outputs":[{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"name":"setPubkey","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"content","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"addr","outputs":[{"name":"ret","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"name":"setABI","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"name","outputs":[{"name":"ret","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],"name":"setName","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes32"}],"name":"setContent","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"pubkey","outputs":[{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"addr","type":"address"}],"name":"setAddr","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"ensAddr","type":"address"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"a","type":"address"}],"name":"AddrChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes32"}],"name":"ContentChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"name","type":"string"}],"name":"NameChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"contentType","type":"uint256"}],"name":"ABIChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"x","type":"bytes32"},{"indexed":false,"name":"y","type":"bytes32"}],"name":"PubkeyChanged","type":"event"}]).at(address);
  }
  return publicAddrResolver;
}

Template['status-owned'].onCreated(function() {
  const template = this;
  TemplateVar.set(template, 'owner', null);
  let prevName;

  web3.eth.getAccounts((err, accounts) => {
    if (!err && accounts && accounts.length > 0) {
      TemplateVar.set(template, 'accounts', accounts);
    }
  })

  function getContent(name) {
    var node = namehash(name)
    var resolverAddress = ens.resolver(node);
    if (resolverAddress === '0x0000000000000000000000000000000000000000') {
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
    return resolverContract.at(resolverAddress).content(node);
  }

    // // namehash('addr.reverse') = 'd1fc7a8be8c2cba3af74a24ebe54bbde1d4708b33c472dfda6209bfa347264c7'
    // var reverseRegistrar = ;

  ens.owner('addr.reverse' , (err, res) => {
    if (!err) {
      var reverseRegistrarContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"resolver","type":"address"}],"name":"claimWithResolver","outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"}],"name":"claim","outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"ens","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"defaultResolver","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"node","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"}],"name":"setName","outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},{"inputs":[{"name":"ensAddr","type":"address"},{"name":"resolverAddr","type":"address"}],"payable":false,"type":"constructor"}]);

      TemplateVar.set(template, 'reverseRegistrar', reverseRegistrarContract.at(res));
    }
  });

  template.autorun(() => {
    const name = Session.get('searched');
    if (prevName == name) return;
    prevName = name;
    TemplateVar.set(template, 'name', name);
    var entryData = TemplateVar.get(template, 'entryData');

    const entry = Names.findOne({name: name});

    if (typeof entry == 'undefined' || entry.owner == null || entry.fullname == null) {
      setTimeout(function() {
          TemplateVar.set(template, 'entryData', Names.findOne({name: name}));
      }, 3000);
      return;
    }

    TemplateVar.set(template, 'address', null);
    TemplateVar.set(template, 'content', null);
    TemplateVar.set(template, 'hasSetResolver', false);
    TemplateVar.set(template, 'owner', entry.owner);

    ens.owner(entry.fullname , (err, owner) => {
      if (!err) {
        // gets owner of current name
        TemplateVar.set(template, 'owner', owner);

        ens.reverse(owner, (err, resolver) =>{
            // gets the name that owner goes by
            if (!err && resolver.name) {
              resolver.name((err, name) => {
                // check if claimed name is valid
                console.log('reverseIsSet', name, entry.fullname)
                TemplateVar.set(template, 'reverseIsSet', name == entry.fullname);
              });
            }
        })
      }
    });
    ens.resolver(entry.fullname, (err, res) => {
      if (!err) {
        TemplateVar.set(template, 'hasSetResolver', true);
        res.addr((err, address) => {
          if (!err) {
            TemplateVar.set(template, 'address', address);
          }
        });
        res.content((err, content) => {
          if (!err) {
            TemplateVar.set(template, 'content', content.replace('0x', ''));
          }
        });
      }
    });

    TemplateVar.set(template, 'entryData', entry);
  })
});

Template['status-owned'].helpers({
  records() {
    return {
      addr: TemplateVar.get('address'),
      content: TemplateVar.get('content')
    };
  },
  owner() {
    return TemplateVar.get('owner')
  },
  hasENSOwner() {
    return Number(TemplateVar.get('owner')) > 0;
  },
  deedOwner() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return '';
    return entry.owner;
  },
  isMine() {
    var entry = TemplateVar.get('entryData')
    var accounts = TemplateVar.get('accounts')
    if (!entry || !accounts) return;
    return accounts.indexOf(entry.owner) > -1;
  },
  registrationDate() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return 'loading';
    var date = new Date(entry.registrationDate * 1000);
    return date.toISOString().slice(0,10);
  },
  releaseDate() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return 'loading';
    var releaseDate = new Date((entry.registrationDate + 365 * 24 * 60 * 60) * 1000);
    return releaseDate.toISOString().slice(0,10);
  },
  canRelease() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return false;
    var releaseDate = new Date((entry.registrationDate + 365 * 24 * 60 * 60) * 1000);

    return Date.now() > releaseDate;
  },
  finalValue() {
    const entry = Names.findOne({name: Session.get('searched')});
    if (!entry) return;
    return Math.max(entry.value, 1.00);
  },
  noBids() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return true;
    var val = entry.value;
    return val.toFixed() <= 1.00;
  },
  renewalDate() {
    var years = 365 * 24 * 60 * 60 * 1000;
    var entry = TemplateVar.get('entryData')
    if (!entry) return 'loading';
    var date = new Date(entry.registrationDate * 1000 + 2 * years);
    return date.toISOString().slice(0,10);
  },
  highestBid() {
    var entry = TemplateVar.get('entryData')
    if (!entry) return '--';
    var val = entry.highestBid;
    return web3.fromWei(val, 'ether');
  },
  content() {
    return TemplateVar.get('content') == '0x' ? 'not set' : TemplateVar.get('content').replace('0x','');
  },
  hasContent() {
    return TemplateVar.get('content') != 0  ;
  },
  transferring() {
    return TemplateVar.get('transferring');
  },
  claiming() {
    return TemplateVar.get('claiming');
  },
  releasing() {
    return TemplateVar.get('releasing');
  },
  bids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false});
  },
  hasBids() {
    const name = Session.get('searched');
    return MyBids.find({name: name, revealed: false}).count() > 0 ;
  },
  hasNode() {
    return LocalStore.get('hasNode');
  },
  needsFinalization() {
    var entry = TemplateVar.get('entryData');
    var owner = TemplateVar.get('owner');
    if (!entry) return true;
    return owner !== entry.owner;
  },
  refund() {
    var entry = TemplateVar.get('entryData');
    if (!entry || !entry.deedBalance) return '-';
    return web3.toWei(entry.deedBalance - entry.value, 'ether');
  },
  canRefund() {
    var entry = TemplateVar.get('entryData');
    if (!entry) return false;
    return entry.deedBalance !== entry.value;
  },
  finalizing() {
    const name = Session.get('searched');
    return TemplateVar.get('finalizing-'+name);
  },
  settingResolver(){
    const name = Session.get('searched');
    console.log('settingResolver', name, TemplateVar.get('settingResolver-'+name));

    return TemplateVar.get('settingResolver-'+name);

  },
  settingAddress(){
    const name = Session.get('searched');
    console.log('settingAddr', name, TemplateVar.get('settingAddr-'+name));
    return TemplateVar.get('settingAddr-'+name);

  }
})

Template['status-owned'].events({
  'click .transfer': function(e, template) {
    const owner = TemplateVar.get('owner');
    const newOwner = TemplateVar.getFrom('.transfer-section .dapp-address-input', 'value');
    const name = template.data.entry.name;
    if (!newOwner) {
      GlobalNotification.error({
          content: 'Invalid address',
          duration: 3
      });
      return;
    }
    TemplateVar.set(template, 'transferring', true);
    registrar.transfer(name, newOwner, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Transfer completed',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'transferring', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not transfer name',
            duration: 5
          });
          TemplateVar.set(template, 'transferring', false);
      }
      })
    );
  },
  'click .release': function(e, template) {
    const owner = TemplateVar.get('owner');
    const name = template.data.entry.name;

    TemplateVar.set(template, 'releasing', true);
    registrar.releaseDeed(name, { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Name released',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'releasing', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not release name',
            duration: 5
          });
          TemplateVar.set(template, 'releasing', false);
      }
    })
    );
  },
  'click .claim': function(e, template) {
    const owner = TemplateVar.get('owner');
    const name = template.data.entry.name;


    const reverseRegistrar = TemplateVar.get(template, 'reverseRegistrar');

    TemplateVar.set(template, 'claiming', true);
    reverseRegistrar.setName(name+'.eth', { from: owner, gas: 300000 },
      Helpers.getTxHandler({
        onSuccess: () => GlobalNotification.warning({
          content: 'Association was completed',
          duration: 5
      }),
        onDone: () => TemplateVar.set(template, 'claiming', false),
        onError: () => {
          GlobalNotification.error({
            content: 'Could not make reverse record',
            duration: 5
          });
          TemplateVar.set(template, 'claiming', false);
      }
    })
    );
  },
  /*
    This would point the name to a public resolver,
    which supports the addr record type.
  */
  'click .set-resolver': function(e, template) {
    const owner = TemplateVar.get('owner');
    const fullname = template.data.name;
    const publicResolver = getPublicAddrResolver();
    const newOwner = TemplateVar.getFrom('.transfer-section .dapp-address-input', 'value');
    if (!publicResolver) {
      GlobalNotification.error({
        content: `Public resolver not found on ${network} network.`,
        duration: 5
      });
      return;
    }
    TemplateVar.set('settingResolver-'+fullname, true);
    ens.setResolver(fullname, publicResolver.address, {from: owner, gas: 300000},
      Helpers.getTxHandler({
        onSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'settingResolver-'+fullname, false)
      })
    );
  },
  'click .edit-addr': function(e, template) {
    TemplateVar.set('editingAddr', true);
  },
  'click .cancel-edit-addr': function(e, template) {
    TemplateVar.set('editingAddr', false);
  },
  'click .set-addr': function(e, template) {
    const owner = TemplateVar.get('owner');
    const fullname = template.data.name;
    const newAddr = TemplateVar.getFrom('.addr-record .dapp-address-input', 'value');
    const publicResolver = getPublicAddrResolver();
    if (!publicResolver) {
      GlobalNotification.error({
        content: `Public resolver not found on ${network} network.`,
        duration: 5
      });
      return;
    }
    TemplateVar.set('settingAddr-'+fullname, true)
    publicResolver.setAddr(ens.namehash(fullname), newAddr, {from: owner, gas: 300000},
      Helpers.getTxHandler({
        onSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'settingAddr-'+fullname, false)
      })
    )
  },
  'click .edit-hash': function(e, template) {
    TemplateVar.set('editingHash', true);
  },
  'click .cancel-edit-hash': function(e, template) {
    TemplateVar.set('editingHash', false);
  },
  'input .content-input': function(e, template) {
    TemplateVar.set('newHash', e.currentTarget.value.toLowerCase().replace(/^0x|[^a-f0-9]/g,''));
  },
  'click .set-hash': function(e, template) {
    const owner = TemplateVar.get('owner');
    const fullname = template.data.name;
    const newHash = '0x' + TemplateVar.get('newHash');
    const publicResolver = getPublicAddrResolver();
    if (!publicResolver) {
      GlobalNotification.error({
        content: `Public resolver not found on ${network} network.`,
        duration: 5
      });
      return;
    }
    TemplateVar.set('settingHash', true)
    publicResolver.setContent(ens.namehash(fullname), newHash, {from: owner, gas: 300000},
      Helpers.getTxHandler({
        onSuccess: () => Helpers.refreshStatus(),
        onDone: () => TemplateVar.set(template, 'settingHash', false)
      })
    )
  },
  'click .finalize': function(e, template) {
    const name = template.data.entry.name;

    console.log('template' ,template)

    TemplateVar.set(template, 'finalizing-'+name, true);
    registrar.finalizeAuction(name, {
      from: template.data.entry.deed.owner,
      gas: 200000
    }, Helpers.getTxHandler({
      onDone: () => TemplateVar.set(template, 'finalizing-'+name, false),
      onSuccess: () => Helpers.refreshStatus()
    }));
  }
});

Template['aside-owned'].helpers({
  deedBalance() {
    const entry = Names.findOne({name: Session.get('searched')});
    return entry.deedBalance || '--' ;
  },
  finalValue() {
    const entry = Names.findOne({name: Session.get('searched')});
    if (!entry) return '--';
    return entry.value;
  },
  canRefund() {
    const entry = Names.findOne({name: Session.get('searched')});
    if (!entry) return false;
    return entry.deedBalance !== entry.value;
  }
})
