import { Funcs } from "./utils/Funcs.js"

// 1. listen selections of items
// 2. Show pop-up menu regarding to selected items
// 3. Manipulate selected items
export class SelectionManager {
    constructor() {
        this.selectedItems = [];
        
        var parent = document.getElementById("container");
        this.table = document.createElement("table");
        this.table.id = "menu";
        this.table.style.position = "absolute";
        this.table.style.backgroundColor = "white";
        this.table.style.border = "1px solid #dadada";
        this.table.style.boxShadow = "2px 2px 2px 2px #e1e1e1";
        this.table.style.borderRadius = "3px";
        this.table.style.zIndex = 100;
        this.table.style.left = 20 + "px";
        this.table.style.top = 100 + "px";
        parent.appendChild(this.table);
        $("#menu").hide();

        this.row = document.createElement("tr");
        this.row.id = "menu-row";
        this.table.appendChild(this.row);

        this.deleteCell = document.createElement("td");
        this.deleteCell.id = "btn-del";
        this.deleteBtn = document.createElement("div");
        this.deleteBtn.className = "btn-menu";
        this.deleteCell.appendChild(this.deleteBtn);
        this.deleteBtn.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMzIiIGhlaWdodD0iMzIiCnZpZXdCb3g9IjAgMCA0OCA0OCIKc3R5bGU9IiBmaWxsOiMwMDAwMDA7Ij48cGF0aCBmaWxsPSIjYjM5ZGRiIiBkPSJNMzAuNiw0NEgxNy40Yy0yLDAtMy43LTEuNC00LTMuNEw5LDExaDMwbC00LjUsMjkuNkMzNC4yLDQyLjYsMzIuNSw0NCwzMC42LDQ0eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiM5NTc1Y2QiIGQ9Ik0yOCA2TDIwIDYgMTQgMTIgMzQgMTJ6Ij48L3BhdGg+PHBhdGggZmlsbD0iIzdlNTdjMiIgZD0iTTEwLDhoMjhjMS4xLDAsMiwwLjksMiwydjJIOHYtMkM4LDguOSw4LjksOCwxMCw4eiI+PC9wYXRoPjwvc3ZnPg==')";

        this.fixCell = document.createElement("td");
        this.fixBtn = document.createElement("div");
        this.fixBtn.className = "btn-menu";
        this.fixCell.appendChild(this.fixBtn);
        this.fixBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAADk0lEQVRYheWXTWhcVRTHf+d9JJOAM2nFLJRSDRZtZ5rYbpQYG4tpLEFRWxwnkRa0iyatBXFVFaEfgqJSpSopRTciSZqqS0FmktKYbkqFxMykH1kooRpJRUmtkUzy3nExUzKZmZfOm1oXejbvcc///s/v3Xvfve/B/z2krF5HPw9iW2+BPpN1+Qq7+lV2PfWHXyvDd3FVwTb7QLeh+g7wLsp25md7fXtRzgh81BPGlCSGPsLujmEAjp3YhLqncWUde2Pn/dhZvgEsVqHAgjVCYvxpAC4mExiA6a4GbjGAOKOolcZ0d4HuAFUM5x5gDsca8Wvnfw3s3jGF8DqqH/DXNYvZazZwBJHX2Bv95dYDAHS2v4fqo9iVVdiVVYjRTGfsSFleNxWJ5BSJ5M83Y1H6Guj+rBa34gHuMAaIRp1sa80STX+/yRX3MYz0CF07p/9ZAKwhDL2P+eA4iWQKVRMIABAf+xIRh+mfIhi/rQX7ArC2FFcfa0A0r6FiMSV2Xi5fWwZAd98TSxvmmxFtxb5aT0skimnsz4HbT0skijWzHtFW5s3mJV2P9TzpVab4TtjdEwXpQ2QDnbHRopp4qgnRbwFwaaI1cqa4V+8G4DtUnmNP7GR+unAEPuy9E+Q4ILi61YscQ1cUvc8P0a2AYHA8430jAJNDQCjb+2FPY5Vgzv3KZXSNmavWYMnB/HThWyDaw6p7HyQ99yvTlyc9jcW9Dc3OoIE3APxI7V1DBKpqmJwoODELR6CrY5DK6hmCNUE621/ytM0dAbjdU9fVvo/QyhCB6t/p6hi8MQCAMAVSz6nzd3sao3U5MGFPWeL7OpAIStFzojiA6lnAwnEK5iwncjYa3egtk0OgJnC2dACMEyAOsJN4al9B+tQPATAaclpWZ540LwaSL4M8D+JgLvSXDrAlPAn6aeYB9CiJ5Md8PbE4587sHtDQkj5iHEazqzJ+LkQ81Y3yfibpfsLmhsvFSnl/ksXPhZDAEFAPgMoMopeAP4Emir5BkkTdBdSoQ/Q68Cjpyk20rbnqDwDgm9FaTLMP2LyszjsGSadjtG284iVY/jB6vGGa4XALIi8Cl0qvKxcReYHh8JblioOfr+IDatA0vg3Rwyj3e6gmQN9gOHKSA+KWhFoywPXoT1WwglcQPcjikbyAyJvMVbxN25o5P3bl/RkBDIw1ovIFIhaO8yyt9afL9io74uMPMTDW+O8X/i/F3yKYG2dALiUYAAAAAElFTkSuQmCC")';
        this.fixBtn.addEventListener('click', e => {
            this.fix_callback();
        });
        // this.fixBtn.addEventListener('click', e => {
        //     if (!this.selectedItems[this.selectedItems.length - 1].fixed_constraint) { // set fixed constraint

        //         this.selectedItems[this.selectedItems.length - 1].fixed_constraint = true;
        //         $(this.fixBtn).addClass("btn-active");

        //         var first_selected_item = this.selectedItems[0];
        //         var last_selected_item = this.selectedItems[this.selectedItems.length - 1]
        //         if (first_selected_item.constructor.name == "Segment") {

        //             if (first_selected_item.point1.fixed_constraint && first_selected_item.point2.fixed_constraint) {
        //                 console.log("both are fixed.")
        //                 for (var i = 0; i < first_selected_item.attached_items.length; i++) {
        //                     var item = first_selected_item.attached_items[i].item;
        //                     console.log("item " + item.name())
        //                     if (item.constructor.name == "Point") {
        //                         item.slope_constraint = first_selected_item.getSlope();
        //                     }
        //                 }
        //             }
        //         }

        //     }
        //     else { // remove horizontal constraint...
        //         this.selectedItems[this.selectedItems.length - 1].fixed_constraint = false;
        //         $(this.fixBtn).removeClass("btn-active");
        //     }
        // });

        this.parallelCell = document.createElement("td");
        this.parallelBtn = document.createElement("div");
        this.parallelBtn.className = "btn-menu";
        this.parallelCell.appendChild(this.parallelBtn);
        this.parallelBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAACC0lEQVRYhe2UTUtUYRiGr+eco2nlOeOoEX0JRYJUBBF9kGniQsEWZdAfaOH/6T+0SHMRkUESJg0GuYqshQsrhNDKGc+oVDTnvVvowsaPcTI3Ndf2Oc97X7yH94YKFSr879hmg4UXUb3nu1ac3+hMVXI27xeSybBz8euuCsSZ1F1MPYiTm+x8AD0HBsOa/Iid5+d2gvSW6jgX3Ui1xQMlBCJt58BVshIPzfTg23Lt2MHuueW1w8+jTfv3VP1ox6wXcRtojNri3zJ3KrCWAjAtmDXYCzQCzcUZxQLBBgfFMoYQT0l4Fbl4hmu4/MvwuGRnTXQBt4ADRXsB0GLQUo71uhvQKDXWyfetljSAHx+OOkzWB+4m2KESOXMSw2YajNryT7YUKBcJbyGTOuN7nJOjGSONOQfkcEx5cq/r2pfe7TTn32XDXzA/lj7qB8lFk1oxGpBVYzYvaRIxkboaT++aQJwJJ8FOldibQRrE5354OT9hRsmnG4+HF0x2J7wS95cQKLsHPiINYTwrJMGb9L7sbLaQrvWTpMnDTkuuA6yX1edZThEJeC9jxhOJ4AQrxbIjtlNEw6B7nnMjde1LX9YOcqOplFWry1Zq9TorjVcO6/rlj3tA40dqF5OlHhl9oG6gaZMvP2E2hvS4EASPGi5l839FoJhspv5YAM2gepQ4RM7QVPEtVqhQoUIxvwCAxNJev5XmtQAAAABJRU5ErkJggg==")';

        this.equalCell = document.createElement("td");
        this.equalBtn = document.createElement("div");
        this.equalBtn.className = "btn-menu";
        this.equalCell.appendChild(this.equalBtn);
        this.equalBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAAXUlEQVRYhWNgGAWjYBSMgpEOGNEF5qhv+E9LC1NuBqDYyURLy4gBA+4AFkwhxjD6O2MUjGSApRzYGEpLC1Nu+q9G5mPJBf9X0dIBDGieHvByYMAdMApGwSgYBaMAADqCChT/7bHUAAAAAElFTkSuQmCC")';

        this.colorCell = document.createElement("td");
        this.colorBtn = document.createElement("div");
        this.colorBtn.className = "btn-menu";
        this.colorCell.appendChild(this.colorBtn);
        this.colorBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAFEklEQVRYhe2X3U9TZxzHv8/p6av0DZDwIgVMBGwV3RIRFnxLptGCZrrg5paYoMabGRN3YfYv6M0udjGzbHFuMfMlWeI0iHHLEBREM9dl65zCrLTKEFqkb/Scnvb8dlNKW0+Bst1tv6v2ec739/n0Oec5pwf4rxdbapCu7DFCQ+sAADqdi227HFlKH25J8O49h6AhH4B+AP0QhGfU09G1lF4FrwDd2N0BGd8pZAmEdua8ev1fE6DOzjokkx0gqgbH/QGO+waHhR4QNueJ9A6a/U5JLR0gGY0A+UhOXt3W6npasADt2/cOgHMAtBnDnsTe8SBfWrJeMZOMufrKXloA1GYMiwx0cEvzg0tKGcVrgDo76xTgAFAXuTewUgr4f1OAP5Sio7U5cADQEti5Hx68VrNoASQSuxXgKRJM0aFBW6ZECl4BgkUxA+j4JOtYvACwIs94lkRiKuCm5IxbioxWzQNPRWArRODhvAIpicidQb0Y8BgAmBY6nMns98UL8PwFAJ48vaT0hyB5o78EvEpzOeWRZ4wXFVG5A9GPr7RHgZPwPwnh7oUQQJm/Tgr7tLc0NaJRW46Nchwa8scAAC5/fKhvSg7/GSvZAkCdTjCEqiqNQZ1BfeP07Z2nTrb1dGfyVDnwQwRcAFALg7UcxbYRPPtVh7kLUgVSTUaeTzeDcJvTQuaKNMkhrcbXOya2+outAUmvnTvXDKGKCqNPb1A3AahhYO/tOLTKe/PssGvukFRNnrpi1GvgA2DOWhL/qBt3z1dnrkQ08qw/PDNWb2nGGO+oxCcTycpQseVxeLl1Uy7cYFA7svoxBJOxeM1H278PZp0CrY5bB1nOhgNAaY0Dre+7pTtf6z3j096QKGnUKh3ZStaOaWPctzdXqMklJ94efhol0eMfsBbxcXu90VZbY43p9bzjlX4EM6/VtgC4kSUwX4kzBoyP1CMqP0aChUDQ0LivFn1lu3HcIyEy3gejMEycHMcLsrKfRhrZkbIprNTHFPvJKplmP6cFBD7mMsS1QeScAtE76Z68eLtaxdSm5XCsBAEP47H+obhQ+aO1Ym/IIzNJMFWJxuYIilRvzOY+HSoPHW3+y72qRMhdhWmdCndnv6S3YdkH+yMgOgEgbTcLB5vb56OSOPRIFNom1rQ8fjQdjfATQogZ7I8QTrQhmryXxhBMn92rqB4O6NwZcCLCieMt10OvCABA0YdvnWVg7QDrjXsnXLlwAJKb58PPW968P7G+dVM8KfMsmeCZsWkTM228D0ETQua9ICUxEtC7AOpljNpPbu7+MpOp+DQcODGgjwicG4S63LmvVIKE1D7/+cVU7xN1EqKteOusoLyBV+dmAHgQlu3o2ibkTijeCcMx7oASPFVpgL3UYktUmWuU5nKqDibVu0oTigIcoTFPo7liLFTU5ojteL1pBgyhBY+XsXrRAgD5FoKrN9T7VFajo8JscjibHGNg7OUCBqOLFkgwXAWYmA+u2dDgVZWa09ur3GxqdK6zj88jIYD4a4sW2HWm9SmDfBBA9kXD4FE3N3i4UtOa3Ey5ybR659rGUbz6FBVAdBD727y5mbwCALD9TOslJvMNYDgGYqcA6lLHYnZViSmYL1NlsbxEWLaDsS4QOw3gGGRVAzq3Xs6XKfhv+ZHrUSdkdk0hSwTZ+UV7UU8h/Qp+Mfl817JugB0GWOZKTBOxrkLhwD94NTt6c8pMoqYFAGa4ZYPnnWzhrfh/KdTf4ngZpoO7kYkAAAAASUVORK5CYII=")';

        this.horizCell = document.createElement("td");
        this.horizBtn = document.createElement("div");
        this.horizBtn.className = "btn-menu";
        this.horizCell.appendChild(this.horizBtn);
        this.horizBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAAQ0lEQVRYhWNgGAWjYBSMglEwCkY6YEQXMJlx+z8tLTyToYpiJxMtLSMGDLgDWNAF/jMyhA2EQ0bBKBgFo2AUjIKRCwDY5AVgiDtmygAAAABJRU5ErkJggg==")';
        this.horizBtn.addEventListener('click', e => {
            if (!this.selectedItems[0].horizontal_constraint) { // set horizontal constraint
                this.selectedItems[0].makeHorizontalOrVertical();
                //  this.horizBtn.className = "btn-menu btn-active";
                $(this.horizBtn).addClass("btn-active");
            }
            else { // remove horizontal constraint...
                this.selectedItems[0].horizontal_constraint = false;
                $(this.horizBtn).removeClass("btn-active");
            }
        });

        this.vertCell = document.createElement("td");
        this.vertBtn = document.createElement("div");
        this.vertBtn.className = "btn-menu";
        this.vertCell.appendChild(this.vertBtn);
        this.vertBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAAQUlEQVRYhe3OQREAIAzEwBRlmACR1ATOwEOHH8n/bhZ+L8rL3IOIBcA5k9GzctPKgEcJECBAgAABAgQIECBAgAC790QGOL6za4wAAAAASUVORK5CYII=")';
        this.vertBtn.addEventListener('click', e => {
            if (!this.selectedItems[0].vertical_constraint) { // set horizontal constraint
                this.selectedItems[0].makeHorizontalOrVertical(false);
                $(this.vertBtn).addClass("btn-active");
            }
            else { // remove horizontal constraint...
                this.selectedItems[0].vertical_constraint = false;
                $(this.vertBtn).removeClass("btn-active");
            }
        });

        this.clipCell = document.createElement("td");
        this.clipBtn = document.createElement("div");
        this.clipBtn.className = "btn-menu";
        this.clipCell.appendChild(this.clipBtn);
        this.clipBtn.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAC2ElEQVRYhe2VO0wUURSG/3N3Znf2SURYDSCCsosSEzoMio0lhYXRDSrZiI2VUmhsrG0sTIzG2KhBoyZjYiXaaGOhhZUmhkUw4SViwMi+Zp9zjwWBBIYxO5ssNpzyP/f898s59wFsx38Oclqg61/dGdN9ggi9gGxcUcUiEX9IBenV5f5IoWYAj/VEuynFWwB7CPRZEs8DADGaCehmYBaS+4fOdiYq9VScAJjSdQvgHxDq0fOx9oX1cN9bpTRHpcA9AMcr9RROAEB8mIjuDm3YHADisf0zYL5PoB4nlo46wBJTgOyyzRPtZWDGiafTDjwE0fCD54mmjakRfbwZwEViGqkZQEBEHwH4Ikg81XV2req6zi4p6RmAKeSV2zUDiMXIZBaDAHoM+e3cqp6RE3ECjriAgaGh9nzNAADgwpmOWQBvAHFsVSNGHxO9jw9Ex5z6OQYAAKb1dUQkwVyVV1VFxIiCeGINiDEJIFKNl+Uanrx0rUUItdeuQAiVmGVkemEifGr4+mkAmFkcb2wNR5viV28MGiXD9imWsvTx5Z2bc/8EEELtBbNuZ+JR3CASmP41dgXMAIDp+TG0hqNQFPcTFLN2pRBCjQF4sU6zXW0Tfi0IZoaRy6xp2UIazAy/N+TUrgoAbwiFUg6mLK9ppllGsZSDT6urPYBPC8HIpSx6Jp+G3xuoPYDfG0Q2n7boRj65NR3wa3XI5q0dyOYyW3EGCD5PAMZmAPkUNNULxaXWDsDr8UMIl80IVqB8WrB2AH4tBGa2GUFq5SpqzsbgDMAbQrGUg2mWLTlTllEo5x0DWF7C9J/FSNHY/EfdF+7CcnIJv+fnNs0nlxehkmKbd/s0y39hASgVCw1GOmkpDgXr0dbSxYnJT2Ujndz0pP1cmCwfOtin+NzvsPR73pInhRo2ahWPYNfutqKmBUbrD3Q3KKrH0iLV487t6OhsdKnu1zvrm0uV+m7HdvwF+esP7eappjwAAAAASUVORK5CYII=")';
        this.clipBtn.addEventListener('click', e => {
            this.clip_callback();
        })
    }

    selectItem(item) {
        this.selectedItems.push(item);
        $("#menu-row").empty();

        var selection_info = this.getSelectionType();
        if (selection_info != undefined) {

        }
        if (selection_info == undefined) {

        }
        else if (selection_info.type == "pt") {
            $("#menu-row").append([this.clipCell, this.colorCell]);
            $("#menu").show(100);

            var point = selection_info.items[0];

            this.clip_callback = () => {

                var snapped_item = point.snapped_item;
                if (snapped_item != undefined && !point.isAttachedTo(snapped_item)) {

                    var pt = point.pt_c;
                    if (snapped_item.constructor.name == "Point") {
                        point.addAttachedItem({ item: snapped_item, parent: snapped_item.parent });
                        snapped_item.addAttachedItem({ item: point, parent: point.parent })

                        if(snapped_item.attached_circle_info != undefined){
                            point.attached_circle_info = snapped_item.attached_circle_info;
                            point.setAttachedCircleInfo(snapped_item.attached_circle_info);
                        }
                        else if(snapped_item.attached_segment_info != undefined){
                            point.attached_segment_info = snapped_item.attached_segment_info;
                        }
                    }
                    else if (snapped_item.constructor.name == "Segment") {
                        if(point.parent.constructor.name == "Circle")
                        {
                            var info1 = {center_pt : point, point_to_rotate : snapped_item.point2}
                            var info2 = {center_pt : point, point_to_rotate : snapped_item.point1}
                            snapped_item.point1.point_to_rotate_info = info1;
                            snapped_item.point2.point_to_rotate_info = info2;

                            snapped_item.point1.setPointToRotate(info1);
                            snapped_item.point2.setPointToRotate(info2);
                        }
                        else{
                            snapped_item.addAttachedItem({ item: point, loc: snapped_item.getPercentFromStart(pt), parent: point.parent })
                            point.setAttachedSegmentInfo({ item: snapped_item, loc: snapped_item.getPercentFromStart(pt), diff_vector: { x: snapped_item.point1.pt_c.x - pt.x, y: snapped_item.point1.pt_c.y - pt.y }, parent: snapped_item.parent });
                        }
                        point.attached_segment_info = { item: snapped_item, loc: snapped_item.getPercentFromStart(pt), diff_vector: { x: snapped_item.point1.pt_c.x - pt.x, y: snapped_item.point1.pt_c.y - pt.y }, parent: snapped_item.parent }
                    }
                    else if(snapped_item.constructor.name == "Circle"){
                        snapped_item.addAttachedItem({ item: point, angle: snapped_item.getAngleOfPoint(pt), parent: point.parent })
                        point.attached_circle_info = { item: snapped_item, angle: snapped_item.getAngleOfPoint(pt), parent: snapped_item.parent};
                        point.setAttachedCircleInfo({ item: snapped_item, angle: snapped_item.getAngleOfPoint(pt), parent: snapped_item.parent})
                    }
                    if(snapped_item.point_to_rotate_info != undefined){
                        point.point_to_rotate_info = snapped_item.point_to_rotate_info;
                    }
                }
            }

            this.fix_callback = () => {
                point.fixed_constraint = true;
            }
        }
        else if (selection_info.type == "pt pt") {
            $("#menu-row").append([this.clipCell, this.colorCell]);
            $("#menu").show(100);

            this.clip_callback = () => {
                var point1 = selection_info.items[0];
                var point2 = selection_info.items[1];

                point1.addAttachedItem({ item: point2 });
                point2.addAttachedItem({ item: point1 })
            }
        }
        else if (selection_info.type == "seg-pt seg") {
            $("#menu-row").append([this.clipCell, this.colorCell]);
            $("#menu").show(100);

            this.clip_callback = () => {
                var segment = selection_info.items[2];
                var point = selection_info.items[1];
                var pt = point.pt_c;

                var info = { item: segment, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: segment.parent }
                point.addAttachedItem(info);
                segment.addAttachedItem({ item: point, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: point.parent })
            }
        }
        else if (selection_info.type == "seg-pt") {
            $("#menu-row").append([this.fixCell, this.colorCell]);
            $("#menu").show(100);

            this.fix_callback = () => {
                var point = selection_info.items[1];
                point.fixed_constraint = true;
            }
        }
        else if (selection_info.type == "seg pt") {
            $("#menu-row").append([this.clipBtn, this.colorCell]);
            $("#menu").show(100);

            this.clip_callback = () => {
                var segment = selection_info.items[0];
                var point = selection_info.items[1];
                var pt = point.pt_c;

                var info = { item: segment, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: segment.parent }
                point.addAttachedItem(info);
                segment.addAttachedItem({ item: point, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: point.parent })
            }
        }

        else if (selection_info.type == "tri_pt pt") {
            $("#menu-row").append([this.clipBtn, this.colorCell]);
            $("#menu").show(100);

            this.clip_callback = () => {
                var point_tri = selection_info.items[0];
                var point = selection_info.items[1];
                var pt = point.pt_c;

                // var info = { item: segment, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: segment.parent }
                point_tri.addAttachedItem({ item: point, parent: point.parent })
                point.addAttachedItem({ item: point_tri, parent: point_tri.parent });
                //segment.addAttachedItem({ item: point, loc: segment.getLocOfPointAsRatio(pt), diff_vector: { x: segment.start_pt_coor.x - pt.x, y: segment.start_pt_coor.y - pt.y }, parent: point.parent })
            }
        }
        return;
    }

    handleHorizontalBtnClick(e) {

    }

    unselectItem(item) {
        this.removeFromSelectionList(item);

    }

    clearSelection() {
        this.selectedItems.splice(0, this.selectedItems.length)
        
    }

    unselectAll() {
        console.log("hi.")
        $("#menu").hide(150, function () {
            $("#menu-row").empty();
        });

        this.clearSelection();
    }

    removeFromSelectionList(item) {
        var index = this.selectedItems.indexOf(item);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
        }
    }

    getSelectionType() {
        var point_all_types_indexes = [];
        var segment_indexes = [];
        var point_indexes = [];
        var point_of_seg_indexes = [];
        var point_of_tri_indexes = [];

        for (var i = 0; i < this.selectedItems.length; i++) {
            var item = this.selectedItems[i];
            var type = item.constructor.name;
            if (type == "Segment") {
                segment_indexes.push(i);
            }
            else if (type == "Point") {
                point_all_types_indexes.push(i);
                if (item.parent == undefined) {
                    point_indexes.push(i);
                }

                else if (item.parent.constructor.name == "Segment") {
                    point_of_seg_indexes.push(i);
                }

                else if (item.parent.constructor.name == "Triangle") {
                    point_of_tri_indexes.push(i);
                }
            }
        }

        if (point_all_types_indexes.length == 1) {
            var point = this.selectedItems[point_all_types_indexes[0]];
            return { type: "pt", items: [point] }
        }
        else if (point_indexes.length == 1 && segment_indexes.length == 0 && point_of_seg_indexes.length == 0 && point_of_tri_indexes.length == 0) {
            return { type: "pt", items: [this.selectedItems[point_indexes[0]]] }
        }
        else if (segment_indexes.length == 2 && point_of_seg_indexes.length == 1) {
            var parent = this.selectedItems[point_of_seg_indexes[0]].parent;
            var point = this.selectedItems[point_of_seg_indexes[0]];
            var segment1 = this.selectedItems[segment_indexes[0]]
            var segment2 = this.selectedItems[segment_indexes[1]]

            if (parent.id == segment1.id) {
                if (Funcs.arePointsEqual(point.pt_c, segment2.start_pt_coor)) {

                    return { type: "pt pt", items: [point, segment2.point1] }
                }
                else if (Funcs.arePointsEqual(point.pt_c, segment2.end_pt_coor)) {

                    return { type: "pt pt", items: [point, segment2.point2] }
                }
                return { type: "seg-pt seg", items: [segment1, point, segment2] }
            }
            else if (parent.id == segment2.id) {
                if (Funcs.arePointsEqual(point.pt_c, segment1.start_pt_coor)) {

                    return { type: "pt pt", items: [point, segment1.point1] }
                }
                else if (Funcs.arePointsEqual(point.pt_c, segment1.end_pt_coor)) {

                    return { type: "pt pt", items: [point, segment1.point2] }
                }
                return { type: "seg-pt seg", items: [segment2, point, segment1] }
            }
        }
        else if (segment_indexes.length == 1 && point_of_seg_indexes.length == 1) {

            var point = this.selectedItems[point_of_seg_indexes[0]];
            var parent = point.parent;
            var segment = this.selectedItems[segment_indexes[0]];

            if (parent == undefined) {
                return { type: "seg pt", items: [segment, point] }
            }
            else if (parent.id == segment.id) {
                return { type: "seg-pt", items: [segment, point] }
            }
        }
        else if (segment_indexes.length == 1 && point_indexes.length == 1) {
            var point = this.selectedItems[point_indexes[0]];
            var segment = this.selectedItems[segment_indexes[0]];

            if (point.isSnappedTo(segment)) {
                return { type: "seg pt", items: [segment, point] }
            }
        }
        else if (point_of_tri_indexes.length == 1 && point_indexes.length == 1) {
            var point_tri = this.selectedItems[point_of_tri_indexes[0]];
            var point = this.selectedItems[point_indexes[0]];

            if (point_tri.isSnappedTo(point)) {
                return { type: "tri_pt pt", items: [point_tri, point] };
            }
        }

        return undefined;
    }
}
