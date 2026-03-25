import { NLTKTree } from '@/types';

const tree: NLTKTree = {
    "children": [
        {
            "children": [
                {
                    "children": [
                        {
                            "children": [
                                {
                                    "children": [
                                        {
                                            "children": [
                                                {
                                                    "children": [
                                                        {
                                                            "children": [
                                                                {
                                                                    "children": [
                                                                        {
                                                                            "children": [
                                                                                {
                                                                                    "children": [
                                                                                        {
                                                                                            "node": "Closed\ncl_subsumption([15, 8])"
                                                                                        }
                                                                                    ],
                                                                                    "node": "15:empty_mod([12])\nwork\n[c1]\nFalse"
                                                                                }
                                                                            ],
                                                                            "node": "12:fl_conj_who([9])\nbe work\n[c1]\nFalse"
                                                                        },
                                                                        {
                                                                            "children": [
                                                                                {
                                                                                    "node": "Closed\ncl_subsumption([13, 6])"
                                                                                }
                                                                            ],
                                                                            "node": "13:fl_conj_who([9])\nperson\n[c1]\nFalse"
                                                                        }
                                                                    ],
                                                                    "node": "9:tr_every([2],['c1'])\n(who (be work)) person\n[c1]\nFalse"
                                                                },
                                                                {
                                                                    "children": [
                                                                        {
                                                                            "children": [
                                                                                {
                                                                                    "children": [
                                                                                        {
                                                                                            "children": [
                                                                                                {
                                                                                                    "children": [
                                                                                                        {
                                                                                                            "children": [
                                                                                                                {
                                                                                                                    "children": [
                                                                                                                        {
                                                                                                                            "children": [
                                                                                                                                {
                                                                                                                                    "children": [
                                                                                                                                        {
                                                                                                                                            "children": [
                                                                                                                                                {
                                                                                                                                                    "children": [
                                                                                                                                                        {
                                                                                                                                                            "children": [
                                                                                                                                                                {
                                                                                                                                                                    "node": "Closed\ncl_subsumption([22, 21])"
                                                                                                                                                                }
                                                                                                                                                            ],
                                                                                                                                                            "node": "23:int_mod_tr([20])\nexpensive\n[c2]\nTrue"
                                                                                                                                                        }
                                                                                                                                                    ],
                                                                                                                                                    "node": "22:int_mod_tr([20])\ncar\n[c2]\nTrue"
                                                                                                                                                }
                                                                                                                                            ],
                                                                                                                                            "node": "21:up_mon_fun(['c2'],[18,19])\ncar\n[c2]\nFalse"
                                                                                                                                        }
                                                                                                                                    ],
                                                                                                                                    "node": "20:up_mon_fun(['c2'],[18,19])\nexpensive car\n[c2]\nTrue"
                                                                                                                                }
                                                                                                                            ],
                                                                                                                            "node": "19:same_args_tf([14,7])\na car\n[λE.((have E) c1)]\nFalse"
                                                                                                                        }
                                                                                                                    ],
                                                                                                                    "node": "18:same_args_tf([14,7])\na (expensive car)\n[λE.((have E) c1)]\nTrue"
                                                                                                                }
                                                                                                            ],
                                                                                                            "node": "8:empty_mod([16])\nwork\n[c1]\nTrue"
                                                                                                        }
                                                                                                    ],
                                                                                                    "node": "17:tr_conj_who([10])\nperson\n[c1]\nTrue"
                                                                                                }
                                                                                            ],
                                                                                            "node": "16:tr_conj_who([10])\nbe work\n[c1]\nTrue"
                                                                                        }
                                                                                    ],
                                                                                    "node": "14:pull_arg([11])\n(a (expensive car))(λE.((have E) c1))\nTrue"
                                                                                }
                                                                            ],
                                                                            "node": "11:tr_every([2],['c1'])\nλF.((a (expensive car))(λE.((have E) F)))\n[c1]\nTrue"
                                                                        }
                                                                    ],
                                                                    "node": "10:tr_every([2],['c1'])\n(who (be work)) person\n[c1]\nTrue"
                                                                }
                                                            ],
                                                            "node": "8:empty_mod([4])\nwork\n[c1]\nTrue"
                                                        }
                                                    ],
                                                    "node": "7:pull_arg([5])\n(a car)(λE.((own E) c1))\nFalse"
                                                }
                                            ],
                                            "node": "6:up_mon_fun_some(['c1'],[1,3])\nman\n[c1]\nTrue"
                                        }
                                    ],
                                    "node": "5:up_mon_fun_some(['c1'],[1,3])\nλM.((a car)(λE.((own E) M)))\n[c1]\nFalse"
                                }
                            ],
                            "node": "4:up_mon_fun_some(['c1'],[1,3])\nbe work\n[c1]\nTrue"
                        }
                    ],
                    "node": "3:\n(every man)(λM.((a car)(λE.((own E) M))))\nFalse"
                }
            ],
            "node": "2:\n(every ((who (be work)) person))(λF.((a (expensive car))(λE.((have E) F))))\nTrue"
        }
    ],
    "node": "1:\n(every man)(be work)\nTrue"
};

export default tree;
