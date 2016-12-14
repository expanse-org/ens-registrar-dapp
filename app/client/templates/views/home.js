/**
Template Controllers

@module Templates
*/

import { statuses, getNameStatus, getTemplateName } from '/imports/hens';

/**
The home template

@class [template] views_home
@constructor
*/

Template['views_home'].helpers({
    /**
    Get the name

    @method (name)
    */

    'name': function() {
        return this.name || TAPi18n.__('dapp.home.defaultName');
    },
    'network': function() {
      return Session.get('network');
    },
    status() {
      return TemplateVar.get('status');
    },
    shouldRender() {
      return getTemplateName(TemplateVar.get('status'));
    }
});

// When the template is created
Template['views_home'].onCreated(function(){
  var template = this;
  TemplateVar.set(template, 'status', statuses.noName)
	Meta.setSuffix(TAPi18n.__("dapp.home.title"));
  this.autorun(function() {
    var name = Session.get('searched');
    getNameStatus(name)
      .then(status => TemplateVar.set(template, 'status', status));
  })
});
