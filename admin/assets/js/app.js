function randomPassword(length) {

    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var pass = "";

    for(var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }

    return pass;

}

function getChildren(elem) {

    var parent = [];

    $(elem).children('ul').children('li').each(function() {
        var children = {};
        if($(this).children('ul').children('li').length) {
            children = getChildren(this);
        }
        var elem = {
            'id': $(this).data('id'),
            'children': children
        };
        if($(this).data('id')) {
            parent.push(elem);
        }
    });

    return parent;

}

var eventHub = new Vue();

Vue.filter("lang", function(value) {
    if(value in lang) {
        return lang[value];
    } else {
        return value;
    }
});

Vue.component("data-table", {
    template: "#table-template",
    props: [
        "data",
        "columns",
        "headline",
        "search"
    ],
    data: function() {
        var sortOrders = {};
        Object.keys(this.columns).forEach(function(key) {
            sortOrders[key] = -1;
        });
        return {
            checked: [],
            startRow: 0,
            rowsPerPage: 8,
            sortKey: '',
            showSearch: false,
            newHeadline: '',
            oldHeadline: '',
            sortOrders: sortOrders
        };
    },
    created: function() {
        this.oldHeadline = this.headline;
    },
    watch: {
        checked: function() {

            if(this.checked.length) {
                eventHub.$emit("setHeadline", {
                    headline: this.checked.length + " " + lang["selected"] + "<a href='?delete=" + this.checked + "' class='icon delete icon-ios-trash-outline'></a>",
                    showSearch: false
                });
            } else {
                eventHub.$emit("setHeadline", {
                    headline: this.oldHeadline,
                    showSearch: true
                });
            }

        }
    },
    computed: {
        checkAll: {
            get: function() {
                return this.filtered ? this.checked.length == this.filtered.length &&  this.filtered.length > 0 : false;
            },
            set: function(value) {

                var checked = [];

                if(value) {
                    this.filtered.forEach(function(loop) {
                        checked.push(loop.id);
                    });
                }

                this.checked = checked;

            }
        },
        columnSpan: function() {
            return Object.keys(this.columns).length + 1;
        },
        filtered: function() {
            var self = this;
            var searchKey = Object.keys(this.columns)[0];
            return self.data.filter(function(entry) {
                return entry[searchKey].indexOf(self.search) !== -1;
            });
        },
        ordered: function() {
            return _.orderBy(this.filtered, this.sortKey, this.sortOrders[this.sortKey] > 0 ? 'asc' : 'desc');
        },
        limited: function() {
            return this.ordered.slice(this.startRow, (this.startRow + this.rowsPerPage));
        }
    },
    methods: {
        sortBy: function(key) {
            if(!this.sortKey) {
                this.sortKey = key;
                this.sortOrders[key] = 1;
            } else if(this.sortOrders[key] == 1) {
                this.sortOrders[key] = -1;
            } else {
                this.sortKey = '';
                this.sortOrders[key] = 0;
            }
        },
        movePages: function(amount) {
            var newStartRow = this.startRow + (amount * this.rowsPerPage);
            if(newStartRow >= 0 && newStartRow < this.filtered.length) {
                this.startRow = newStartRow;
            }
        }
    }
});

Vue.component("file-table", {
    template: "#file-table-template",
    props: [
        "select",
        "headline",
        "search",
        "tableType",
        "ext"
    ],
    data: function() {
        return {
            tableData: [],
            path: '/',
            editFile: false,
            editFileID: '',
            editFileName: '',
            oldHeadline: "",
            checked: []
        };
    },
    created: function() {
        this.oldHeadline = this.headline;

        if($.session.get("fileTablePath")) {
            this.path = $.session.get("fileTablePath");
        }

        var vue = this;

        $(document).on("fetch", function() {
            vue.fetch();
        });

        vue.fetch();

    },
    watch: {
        checked: function() {
            if(this.checked.length) {
                eventHub.$emit("setHeadline", {
                    headline: this.checked.length + " " + lang["selected"] + "<a href='?delete=" + this.checked + "' class='icon delete ajax icon-ios-trash-outline'></a>",
                    showSearch: false
                });
            } else {
                eventHub.$emit("setHeadline", {
                    headline: this.oldHeadline,
                    showSearch: true
                });
            }
        },
        path: function() {
            eventHub.$emit("setPath", this.path);
            $.session.set("fileTablePath", this.path);
            this.fetch();
        }
    },
    computed: {
        checkAll: {
            get: function() {
                return this.filtered ? this.checked.length == this.filtered.length &&  this.filtered.length > 0 : false;
            },
            set: function(value) {
                var checked = [];

                if(value) {
                    this.filtered.forEach(function(loop) {
                        checked.push(loop.id);
                    });
                }

                this.checked = checked;
            }
        },
        filtered: function() {
            var self = this;
            return self.tableData.filter(function(entry) {
                return entry.name.indexOf(self.search) !== -1;
            });
        },
        breadcrumbs: function() {

            var path = "";
            var str = "";

            if(this.path) {
                str = this.path.split("/").filter(function(str) {
                    return str.length;
                }).map(function(part) {
            	    return {
                        path: path += "/" + part + "/",
                        name: part
                    };
                });
            }

            return str;

        },
        fileSelect: function() {
            if(this.tableType == "select") {
                return true;
            } else {
                return false;
            }
        }
    },
    methods: {
        fetch: function() {

            this.checked = [];

            var vue = this;

            $.ajax({
                method: "POST",
                url: url + "admin/content/media/get",
                dataType: "json",
                data: {
                    path: vue.path
                },
                success: function(data) {
                    vue.tableData = data;
                    $(document).ready(function() {
                        $(".file div").draggable({
                            revert: "invalid",
                            helper: "clone",
                            axis: "y",
                            containment: vue.$el
                        });
                        $(".dir").droppable({
                            hoverClass: "dropActive",
                            drop: function(e, ui) {
                                var drag = $(ui.draggable);
                                var drop = $(this);
                                vue.move(drop.data("path"), {
                                    id: drag.data("id"),
                                    name: drag.data("name")
                                });
                            }
                        });
                    });
                }
            });

        },
        setPath: function(path) {
            this.checked = [];
            this.path = path;
        },
        move: function(path, data) {

            var vue = this;

            $.ajax({
                method: "POST",
                url: url + "admin/content/media/move",
                data: {
                    path: path,
                    file: data.id,
                    name: data.name
                },
                success: function() {
                    vue.fetch();
                }
            });

        },
        edit: function() {

            var vue = this;

            $.ajax({
                method: "POST",
                url: url + "admin/content/media/edit",
                data: {
                    path: vue.path,
                    file: vue.editFileID,
                    name: vue.editFileName
                },
                success: function() {
                    vue.editFile = false;
                    vue.fetch();
                }
            });

        },
        selectFile: function(path) {

            var vue = this;

            if(!path) {
                path = null;
                eventHub.$emit("selectFile", {
                    addMediaModal: false,
                    fileName: path
                });
                this.fileName = path;
            } else {
                var ext = path.split(".").pop();
                if(vue.ext.indexOf(ext) > -1 || !vue.ext.length) {
                    eventHub.$emit("selectFile", {
                        addMediaModal: false,
                        fileName: path
                    });
                    this.fileName = path;
                } else {
                    setMessage(lang["file_select_wrong_ext"] + " " + vue.ext, "error");
                }
            }

        }
    },
    events: {
        fetchData: function() {
            this.fetch();
        }
    }
});

Vue.component("modal", {
    template: "#modal-template",
    props: {
        size: {
            type: String,
            default: ""
        }
    },
    data: function() {
        return {
            "animated": ""
        }
    },
    methods: {
        beforeEnter: function() {
            this.animated = "animated fadeInDown";
        }
    }
});

Vue.component("searchbox", {
    template: "#searchbox-template",
    data: function() {
        return {
            searchBoxShow: false,
            searchBox: "",
            active: "",
            activeID: 0
        }
    },
    props: [
        "list",
        "val",
        "id",
        "except",
        "current",
        "currentid"
    ],
    mounted: function() {
        if(this.current && this.currentid) {
            this.active = this.current;
            this.activeID = this.currentid;
        }
        eventHub.$on("setSearchboxEmpty", this.setEmpty);
    },
    methods: {
        toggleSearchBox: function() {
            this.searchBoxShow = !this.searchBoxShow;
        },
        setActive: function(active, activeID) {

            this.active = active;
            this.activeID = activeID;

            eventHub.$emit("setSearchbox", {
                name: active,
                id: activeID
            });

            this.searchBoxShow = false;
        },
        setEmpty: function() {
            this.active = "";
            this.activeID = 0;
        }
    },
    computed: {
        data: function() {
            var self = this;
            return self.list.filter(function(entry) {
                if(self.except) {
                    if(entry[self.val] != self.except) {
                        return entry[self.val].toLowerCase().indexOf(self.searchBox.toLowerCase()) !== -1;
                    }
                } else {
                    return entry[self.val].toLowerCase().indexOf(self.searchBox.toLowerCase()) !== -1;
                }
            });
        }
    }
});

Vue.component("form-media", {
    template: "#form-media",
    data: function() {
        return {
            search: "",
            headline: "list",
            addMediaModal: false,
            fileName: ""
        }
    },
    props: [
        "value",
        "value2",
        "attr",
        "name",
        "ext"
    ],
    created: function() {

        var vue = this;

        eventHub.$on("selectFile", function(data) {
            vue.fileName = data.fileName;
            vue.addMediaModal = data.addMediaModal;
        });

    }
});
