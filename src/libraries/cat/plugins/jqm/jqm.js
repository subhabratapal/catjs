var animation = false;


_cat.plugins.jqm = function () {

    return {

        actions: {


            scrollTo: function (idName) {

                $(document).ready(function(){
                    var stop = $('#' + idName).offset().top;
                    var delay = 1000;
                    $('body,html').animate({scrollTop: stop}, delay);
                });

            },

            scrollTop: function () {

                $(document).ready(function(){



                    $('html, body').animate({scrollTop : 0},1000);
                });

            },

            clickRef: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');
                    window.location = $('#' + idName).attr('href');
                });

            },


            clickButton: function (idName) {
                $(document).ready(function(){
                    $('.ui-btn').removeClass('ui-focus');
                    $('#' + idName).trigger('click');
                    $('#' + idName).closest('.ui-btn').addClass('ui-focus');
                });

            },

            selectTab: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');
                });

            },



            selectMenu : function (selectId, value) {
                $(document).ready(function(){
                    if (typeof value === 'number') {
                        $("#" + selectId + " option[value=" + value + "]").attr('selected','selected');
                    } else if (typeof value === 'string') {
                        $("#" + selectId + " option[id=" + value + "]").attr('selected','selected');
                    }
                    $( "#" + selectId).selectmenu("refresh", true);
                });

            },



            swipeItemLeft : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swipeleft();
                });
            },


            swipeItemRight : function(idName) {
                $(document).ready(function(){
                    $("#" + idName).swiperight();
                });
            },


            swipePageLeft : function() {
                $(document).ready(function(){
                    $( ".ui-page-active" ).swipeleft();
//                    var next = $( ".ui-page-active" ).jqmData( "next" );
//                    $( ":mobile-pagecontainer" ).pagecontainer( "change", next + ".html", {
//
//                    });


                });


            },


            swipePageRight : function() {
                $(document).ready(function(){
//                    $( ".ui-page-active" ).swiperight();
                    var prev = $( ".ui-page-active" ).jqmData( "prev" );
                    $( ":mobile-pagecontainer" ).pagecontainer( "change", prev + ".html", {

                        reverse: true
                    });
                });
            },


            click: function (idName) {
                $(document).ready(function(){
                    $('#' + idName).trigger('click');
                });

            },

            setCheck: function (idName) {
                $(document).ready(function(){
                    $("#"+ idName).prop("checked",true).checkboxradio("refresh");
                });

            },

            slide : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value).slider("refresh");
                });
            },

            setText : function (idName, value) {
                $(document).ready(function(){
                    $("#"+ idName).val(value);
                });
            },


            checkRadio: function (className, idName) {
                $(document).ready(function(){
                    $( "." + className ).prop( "checked", false ).checkboxradio( "refresh" );
                    $( "#" + idName ).prop( "checked", true ).checkboxradio( "refresh" );
                });

            },

            collapsible : function(idName) {
                $(document).ready(function(){
                    $('#' + idName).children( ".ui-collapsible-heading" ).children(".ui-collapsible-heading-toggle").click();
                });

            }

        }


    };

}();
