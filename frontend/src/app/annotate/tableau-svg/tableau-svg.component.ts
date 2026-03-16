import { Component, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { Dimensions } from '@/types';
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
            {id: 1, head: 'every@man@(be@work)', bg: 'honeydew'},
            {id: 2, head: 'every@(who@(be@work)@person)@(λ1,a@(expensive@car)@(λ2,have@2@1))', bg: 'honeydew'},
            {id: 3, head: 'every@man@(λ3,a@car@(λ2,own@2@3))', bg: 'mistyrose'},
            {id: 4, head: 'be@work', args: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'honeydew'},
            {id: 5, head: '(λ3,a@car@(λ2,own@2@3))', args: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'mistyrose'},
            {id: 6, head: 'man', args: 'c1', rule: 'up_mon_fun_some[1,3]', bg: 'honeydew'},
            {id: 7, head: 'a@car@(λ2,own@2@c1)', rule: 'pull_arg[5]', bg: 'mistyrose'},
            {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[4]', bg: 'honeydew'},
            {id: 9, head: 'be@work', args: 'c1', rule: 'tr_every_c[1,6], [c1]', bg: 'honeydew'},
            {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[9]', bg: 'honeydew'},
        ],
        subtrees: [
            {
                nodes: [
                    {id: 10, head: 'who@(be@work)@person', args: 'c1', rule: 'tr_every[2],[c1]', bg: 'mistyrose'},
                ],
                subtrees: [
                    {
                        nodes: [
                            {id: 13, head: 'be@work', args: 'c1', rule: 'fl_conj_who[10]', bg: 'mistyrose'},
                            {id: 16, head: 'work', args: 'c1', rule: 'aux_verb[13]', bg: 'mistyrose'},
                            {end: true, rule: 'cl_subcat[16,8]'}
                        ],
                    },
                    {
                        nodes: [
                            {id: 14, head: 'person', args: 'c1', rule: 'fl_conj_who[10]', bg: 'mistyrose'},
                            {end: true, rule: 'cl_subsumption[14,6]'}
                        ]
                    }
                ]
            },
            {
                nodes: [
                    {id: 11, head: 'who@(be@work)@person', args: 'c1', rule: 'tr_every[2],[c1]', bg: 'honeydew'},
                    {id: 12, head: '(λ1,a@(expensive@car)@(λ2,have@2@1))', args: 'c1', rule: 'tr_every[2],[c1]', bg: 'honeydew'},
                    {id: 15, head: 'a@(expensive@car)@(λ2,have@2@c1)', args: 'c1', rule: 'pull_arg[12]', bg: 'honeydew'},
                    {id: 17, head: 'be@work', args: 'c1', rule: 'tr_conj_who[11]', bg: 'honeydew'},
                    {id: 18, head: 'person', args: 'c1', rule: 'tr_conj_who[11]' , bg: 'honeydew'},
                    {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[17]', bg: 'honeydew'},
                    {id: 19, head: 'a@(expensive@car)', args: '(λ2,have@2@c1)', rule: 'same_args[15,7]', bg: 'honeydew'},
                    {id: 20, head: 'a@car', args: '(λ2,have@2@c1)', rule: 'same_args[15,7]', bg: 'mistyrose'},
                    {id: 21, head: 'expensive@car', args: 'c2', rule: 'up_mon_fun[19,20]', bg: 'honeydew'},
                    {id: 22, head: 'car', args: 'c2', rule: 'up_mon_fun[19,20]', bg: 'mistyrose'},
                    {id: 23, head: 'car', args: 'c2', rule:'int_mod_tr[21]', bg: 'honeydew'},
                    {id: 24, head: 'expensive', args: 'c2', rule:'int_mod_tr[21]', bg: 'honeydew'},
                    {end: true, rule: 'cl_subsmption[23,22]'}
                ]
            }
        ]
    }
}
