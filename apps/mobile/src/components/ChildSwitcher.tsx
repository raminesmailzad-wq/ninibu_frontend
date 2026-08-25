import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatJalaliShortDate } from '@ninibu/datetime';
import { useChild } from '@/providers/ChildProvider';
import { ChoiceModal } from './ui';
import { colors, typography } from '@/theme';
export function ChildSwitcher(){const {children,selected,select}=useChild();const [open,setOpen]=useState(false);if(!selected)return null;return <><Pressable onPress={()=>setOpen(true)} style={s.box}><View style={s.avatar}><Ionicons name="happy-outline" size={20} color={colors.primary}/></View><View style={{flex:1}}><Text style={s.tiny}>فرزند فعال</Text><Text style={s.name}>{selected.first_name} {selected.last_name}</Text><Text style={s.date}>تولد {formatJalaliShortDate(selected.birth_date)}</Text></View><Ionicons name="chevron-down" size={17} color={colors.muted}/></Pressable><ChoiceModal visible={open} title="انتخاب فرزند" items={children} label={x=>`${x.first_name} ${x.last_name}`} onChoose={x=>select(x.id)} onClose={()=>setOpen(false)}/></>}
const s=StyleSheet.create({box:{flexDirection:'row-reverse',alignItems:'center',gap:10,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:18,padding:10},avatar:{width:40,height:40,borderRadius:13,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},tiny:{ fontFamily: typography.regular,fontSize:9.5,color:colors.muted,textAlign:'right'},name:{ fontFamily: typography.bold,fontSize:12.5,fontWeight:'900',color:colors.foreground,textAlign:'right',writingDirection:'rtl'},date:{ fontFamily: typography.regular,fontSize:9,color:colors.primary,textAlign:'right',marginTop:2,writingDirection:'rtl'}});
