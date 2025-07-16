import { Component, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions } from './types';
import { TableauTree } from './tableau-tree.component';

@Component({
    selector: "la-tableau-svg",
    standalone: true,
    imports: [CommonModule, TableauTree],
    templateUrl: "./tableau-svg.component.svg",
    styleUrl: "./tableau-svg.component.scss",
})
export class TableauSVG {

    treeDimensions$ = new Subject<Dimensions>();
    treeDimensions: Dimensions = {width:0, height: 0};

    constructor(private cdref: ChangeDetectorRef) {}

    onTreeSize(size: Dimensions) {
        this.treeDimensions = size;
    }

    ngAfterViewChecked() {
        this.treeDimensions$.next(this.treeDimensions);
        this.cdref.detectChanges();
    }

    tree: any = {
        nodes: [
            {idx: 1, term: 'every@man@(be@work)', bg: 'honeydew'},
            {idx: 2, term: 'every@(who@(be@work)@person)@(λ1,a@(expensive@car)@(λ2,have@2@1))', bg: 'honeydew'},
            {idx: 3, term: 'every@man@(λ3,a@car@(λ2,own@2@3))', bg: 'mistyrose'},
            {idx: 4, term: 'be@work', label: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'honeydew'},
            {idx: 5, term: '(λ3,a@car@(λ2,own@2@3))', label: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'mistyrose'},
            {idx: 6, term: 'man', label: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'honeydew'},
            {idx: 7, term: 'a@car@(λ2,own@2@c1)', rule: 'pull_arg[5]', bg: 'mistyrose'},
            {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[4]', bg: 'honeydew'},
            {idx: 9, term: 'be@work', label: 'c1', rule: 'tr_every_c[1,6], [c1]', bg: 'honeydew'},
            {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[9]', bg: 'honeydew'},
        ],
        subtrees: [
            {
                nodes: [
                    {idx: 10, term: 'who@(be@work)@person', label: 'c1', rule: 'tr_every[2],[c1]', bg: 'mistyrose'},
                ],
                subtrees: [
                    {
                        nodes: [
                            {idx: 13, term: 'be@work', label: 'c1', rule: 'fl_conj_who[10]', bg: 'mistyrose'},
                            {idx: 16, term: 'work', label: 'c1', rule: 'aux_verb[13]', bg: 'mistyrose'},
                            {end: true, rule: 'cl_subcat[16,8]'}
                        ],
                    },
                    {
                        nodes: [
                            {idx: 14, term: 'person', label: 'c1', rule: 'fl_conj_who[10]', bg: 'mistyrose'},
                            {end: true, rule: 'cl_subsumption[14,6]'}
                        ]
                    }
                ]
            },
            {
                nodes: [
                    {idx: 11, term: 'who@(be@work)@person', label: 'c1', rule: 'tr_every[2],[c1]', bg: 'honeydew'},
                    {idx: 12, term: '(λ1,a@(expensive@car)@(λ2,have@2@1))', label: 'c1', rule: 'tr_every[2],[c1]', bg: 'honeydew'},
                    {idx: 15, term: 'a@(expensive@car)@(λ2,have@2@c1)', label: 'c1', rule: 'pull_arg[12]', bg: 'honeydew'},
                    {idx: 17, term: 'be@work', label: 'c1', rule: 'tr_conj_who[11]', bg: 'honeydew'},
                    {idx: 18, term: 'person', label: 'c1', rule: 'tr_conj_who[11]' , bg: 'honeydew'},
                    {idx: 8, term: 'work', label: 'c1', rule: 'aux_verb[17]', bg: 'honeydew'},
                    {idx: 19, term: 'a@(expensive@car)', label: '(λ2,have@2@c1)', rule: 'same_args[15,7]', bg: 'honeydew'},
                    {idx: 20, term: 'a@car', label: '(λ2,have@2@c1)', rule: 'same_args[15,7]', bg: 'mistyrose'},
                    {idx: 21, term: 'expensive@car', label: 'c2', rule: 'up_mon_fun[19,20]', bg: 'honeydew'},
                    {idx: 22, term: 'car', label: 'c2', rule: 'up_mon_fun[19,20]', bg: 'mistyrose'},
                    {idx: 23, term: 'car', label: 'c2', rule:'int_mod_tr[21]', bg: 'honeydew'},
                    {idx: 24, term: 'expensive', label: 'c2', rule:'int_mod_tr[21]', bg: 'honeydew'},
                    {end: true, rule: 'cl_subsmption[23,22]'}
                ]
            }
        ]
    }
}
