'use strict';
import { Router } from 'meteor/iron:router';
import "../../ui/layout/layout.js";
import "../../ui/pages/home";


Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {
    template: 'home'
});
