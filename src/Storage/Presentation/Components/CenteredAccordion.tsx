import React from 'react'
import { StyleSheet } from 'react-native'
import { List } from 'react-native-paper'

interface CenteredAccordionProps {
    title: string
    expanded: boolean
    onPress: () => void
    children: React.ReactNode
    titleStyle?: object // Optional prop for custom title styling
}

const CenteredAccordion: React.FC<CenteredAccordionProps> = ({
    title,
    expanded,
    onPress,
    children,
    titleStyle,
}) => {
    return (
        <List.Accordion
            title={title}
            expanded={expanded}
            onPress={onPress}
            style={styles.accordion}
            titleStyle={[styles.accordionTitle, titleStyle]}
            right={props => (
                <List.Icon
                    {...props}
                    icon={expanded ? 'chevron-up' : 'chevron-down'}
                    style={styles.accordionIcon}
                />
            )}
        >
            {children}
        </List.Accordion>
    )
}

const styles = StyleSheet.create({
    accordion: {
        padding: 0,
    },
    accordionTitle: {
        fontWeight: 'bold',
    },
    accordionIcon: {
        margin: 0,
    },
})

export default CenteredAccordion