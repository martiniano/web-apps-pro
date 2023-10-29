/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
/**
 * User: Julia.Radzhabova
 * Date: 17.05.16
 * Time: 15:38
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (template) {
    'use strict';

    Common.Views.Plugins = Common.UI.BaseView.extend(_.extend({
        storePlugins: undefined,

        initialize: function(options) {
            _.extend(this, options);
            this._locked = false;
            this._state = {
                DisabledControls: false,
                docProtection: {
                    isReadOnly: false,
                    isReviewOnly: false,
                    isFormsOnly: false,
                    isCommentsOnly: false
                }
            };
            this.lockedControls = [];
            this.pluginPanels = {};
            this.pluginBtns = {};
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el && (this.$el = $(el));

            // this.viewPluginsList = new Common.UI.DataView({
            //     el: $('#plugins-list'),
            //     store: this.storePlugins,
            //     enableKeyEvents: false,
            //     itemTemplate: _.template([
            //         '<div id="<%= id %>" class="item-plugins" style="display: <% if (visible) {%> block; <%} else {%> none; <% } %>">',
            //             '<div class="plugin-icon" style="background-image: url(' + '<%= baseUrl %>' + '<%= variations[currentVariation].get("icons")[((window.devicePixelRatio > 1) ? 1 : 0) + (variations[currentVariation].get("icons").length>2 ? 2 : 0)] %>);"></div>',
            //             '<% if (variations.length>1) { %>',
            //             '<div class="plugin-caret img-commonctrl"></div>',
            //             '<% } %>',
            //             '<%= name %>',
            //         '</div>'
            //     ].join(''))
            // });
            // this.lockedControls.push(this.viewPluginsList);
            // this.viewPluginsList.cmpEl.off('click');

            this.pluginMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: []
            });

            this.trigger('render:after', this);
            return this;
        },

        getPanel: function () {
            var _panel = $('<section id="plugins-panel" class="panel" data-tab="plugins"></section>');
            var _group = $('<div class="group"></div>');
            if ( !this.storePlugins.isEmpty() ) {
                this.storePlugins.each(function (model) {
                    // var btn = new Common.UI.Button({
                    //     cls: 'btn-toolbar x-huge icon-top',
                    //     iconCls: 'img-commonctrl review-prev',
                    //     caption: model.get('name'),
                    //     value: model.get('guid'),
                    //     hint: model.get('name')
                    // });
                    //
                    // var $slot = $('<span class="slot"></span>').appendTo(_group);
                    // btn.render($slot);
                });
            }

            _group.appendTo(_panel);
            return _panel;
        },

        renderTo: function (parent) {
            if ( !this.storePlugins.isEmpty() ) {
                var me = this;
                var _group = $('<div class="group"></div>');
                var _set = Common.enumLock;
                this.storePlugins.each(function (model) {
                    if (model.get('visible')) {
                        var modes = model.get('variations'),
                            guid = model.get('guid'),
                            icons = modes[model.get('currentVariation')].get('icons'),
                            _icon_url = model.get('baseUrl') + me.parseIcons(icons),
                            btn = new Common.UI.Button({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconImg: _icon_url,
                                caption: model.get('name'),
                                menu: modes && modes.length > 1,
                                split: modes && modes.length > 1,
                                value: guid,
                                hint: model.get('name'),
                                lock: model.get('isDisplayedInViewer') ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.selRangeEdit, _set.editFormula] : [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula],
                                dataHint: '1',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'small'
                            });

                        var $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group);
                        btn.render($slot);

                        model.set('button', btn);
                        me.lockedControls.push(btn);
                    }
                });
                var docProtection = me._state.docProtection
                Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {array: me.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {array: me.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockComments, docProtection.isCommentsOnly, {array: me.lockedControls});

                parent.html(_group);
                $('<div class="separator long"></div>').prependTo(parent);
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        ChangeSettings: function(props) {
            this.disableControls(this._locked);
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });

                this.pluginsMask && this.pluginsMask.css('display', disable ? 'block' : 'none');
            }
        },

        SetDisabled: function(disable, reviewMode, fillFormMode) {
            if (reviewMode) {
                Common.Utils.lockControls(Common.enumLock.previewReviewMode, disable, {array: this.lockedControls});
            } else if (fillFormMode) {
                Common.Utils.lockControls(Common.enumLock.viewFormMode, disable, {array: this.lockedControls});
            } else {
                Common.Utils.lockControls(Common.enumLock.viewMode, disable, {array: this.lockedControls});
            }
        },

        openedPluginMode: function(pluginGuid) {
            // var rec = this.viewPluginsList.store.findWhere({guid: pluginGuid});
            // if ( rec ) {
            //     this.viewPluginsList.cmpEl.find('#' + rec.get('id')).parent().addClass('selected');
            // }

            var model = this.storePlugins.findWhere({guid: pluginGuid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(true);
                    this.updatePluginButton(model);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStop);
                    }
                }
            }
        },

        closedPluginMode: function(guid) {
            // this.viewPluginsList.cmpEl.find('.selected').removeClass('selected');

            var model = this.storePlugins.findWhere({guid: guid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(false);
                    this.updatePluginButton(model);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStart);
                    }
                }
            }
        },

        parseIcons: function(icons) {
            if (icons.length && typeof icons[0] !== 'string') {
                var theme = Common.UI.Themes.currentThemeId().toLowerCase(),
                    style = Common.UI.Themes.isDarkTheme() ? 'dark' : 'light',
                    idx = -1;
                for (var i=0; i<icons.length; i++) {
                    if (icons[i].theme && icons[i].theme.toLowerCase() == theme) {
                        idx = i;
                        break;
                    }
                }
                if (idx<0)
                    for (var i=0; i<icons.length; i++) {
                        if (icons[i].style && icons[i].style.toLowerCase() == style) {
                            idx = i;
                            break;
                        }
                    }
                (idx<0) && (idx = 0);

                var ratio = Common.Utils.applicationPixelRatio()*100,
                    current = icons[idx],
                    bestDistance = 10000,
                    currentDistance = 0,
                    defUrl,
                    bestUrl;
                for (var key in current) {
                    if (current.hasOwnProperty(key)) {
                        if (key=='default') {
                            defUrl = current[key];
                        } else if (!isNaN(parseInt(key))) {
                            currentDistance = Math.abs(ratio-parseInt(key));
                            if (currentDistance < (bestDistance - 0.01))
                            {
                                bestDistance = currentDistance;
                                bestUrl = current[key];
                            }
                        }
                    }
                }
                (bestDistance>0.01 && defUrl) && (bestUrl = defUrl);
                return {
                    'normal': bestUrl['normal'],
                    'hover': bestUrl['hover'] || bestUrl['normal'],
                    'active': bestUrl['active'] || bestUrl['normal']
                };
            } else { // old version
                var url = icons[((Common.Utils.applicationPixelRatio() > 1) ? 1 : 0) + (icons.length > 2 ? 2 : 0)];
                return {
                    'normal': url,
                    'hover': url,
                    'active': url
                };
            }
        },

        updatePluginIcons: function(model) {
            if (!model.get('visible'))
                return null;

            var modes = model.get('variations'),
                icons = modes[model.get('currentVariation')].get('icons');
            model.set('parsedIcons', this.parseIcons(icons));
            this.updatePluginButton(model);
        },

        updatePluginButton: function(model) {
            if (!model.get('visible'))
                return null;

            var btn = model.get('button'),
                menuItem = model.get('backgroundPlugin');
            if (menuItem && menuItem.cmpEl) {
                menuItem.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')['normal']);
            } else if (btn && btn.cmpEl) {
                btn.cmpEl.find(".inner-box-icon img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[btn.isActive() ? 'active' : 'normal']);
                var guid = model.get('guid'),
                    leftBtn = this.pluginBtns[guid];
                if (leftBtn && leftBtn.cmpEl) {
                    leftBtn.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[leftBtn.isActive() ? 'active' : 'normal']);
                }
            }
        },

        createBackgroundPluginsButton: function () {
            var _set = Common.enumLock;
            var btn = new Common.UI.Button({
                cls: 'btn-toolbar x-huge icon-top',
                iconCls: 'toolbar__icon btn-background-plugins',
                caption: this.textBackgroundPlugins,
                menu: new Common.UI.Menu({
                    cls: 'background-plugins',
                    style: 'min-width: 230px;',
                    items: [
                        {
                            template: _.template('<div class="menu-header">' + this.textTheListOfBackgroundPlugins + '</div>'),
                            stopPropagation: true
                        }
                    ],
                    restoreHeight: true
                }),
                hint: this.textBackgroundPlugins,
                lock: [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            return btn;
        },

        createPluginButton: function (model) {
            if (!model.get('visible'))
                return null;

            var me = this;

            var modes = model.get('variations'),
                guid = model.get('guid'),
                icons = modes[model.get('currentVariation')].get('icons'),
                parsedIcons = this.parseIcons(icons),
                icon_url = model.get('baseUrl') + parsedIcons['normal'];
            model.set('parsedIcons', parsedIcons);
            var _menu_items = [];
            _.each(model.get('variations'), function(variation, index) {
                if (variation.get('visible'))
                    _menu_items.push({
                        caption     : index > 0 ? variation.get('description') : me.textStart,
                        value       : parseInt(variation.get('index'))
                    });
            });

            var _set = Common.enumLock;
            var btn = new Common.UI.Button({
                cls: 'btn-toolbar x-huge icon-top',
                iconImg: icon_url,
                caption: model.get('name'),
                menu: _menu_items.length > 1,
                split: _menu_items.length > 1,
                value: guid,
                hint: model.get('name'),
                lock: model.get('isDisplayedInViewer') ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.selRangeEdit, _set.editFormula] : [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });

            if ( btn.split ) {
                btn.setMenu(
                    new Common.UI.Menu({
                        items: _menu_items,
                        pluginGuid: model.get('guid')
                    })
                );

                btn.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('plugin:select', [menu.options.pluginGuid, item.value]);
                });
            }

            btn.on('click', function(b, e) {
                me.fireEvent('plugin:select', [b.options.value, 0]);
            });

            model.set('button', btn);
            me.lockedControls.push(btn);
            return btn;
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        showPluginPanel: function (show, guid) {
            if (show) {
                for (var key in this.pluginPanels) {
                    this.pluginPanels[key].hide();
                }
                this.pluginPanels[guid].show();
            } else {
                this.pluginPanels[guid].hide();
                this.fireEvent('hide', this);
            }
            //this.updateLeftPluginButton(guid);
        },

        /*updateLeftPluginButton: function(guid) {
            var model = this.storePlugins.findWhere({guid: guid}),
                btn = this.pluginBtns[guid];
            if (btn && btn.cmpEl) {
                btn.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[btn.pressed ? 'active' : 'normal']);
            }
        },*/

        strPlugins: 'Plugins',
        textStart: 'Start',
        textStop: 'Stop',
        groupCaption: 'Plugins',
        tipMore: 'More',
        textBackgroundPlugins: 'Background Plugins',
        textTheListOfBackgroundPlugins: 'The list of background plugins',
        textSettings: 'Settings'

    }, Common.Views.Plugins || {}));
});