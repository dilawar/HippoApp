<template>
    <f7-page>
        <f7-block-title>Login</f7-block-title>
        <f7-block>
            <f7-list inline-labels no-hairlines-md>
                <f7-list-input type="text" placeholder="Your login/App password" clear-button >
                    <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
                </f7-list-input>

                <f7-list-input type="password" placeholder="Your password" clear-button >
                    <f7-icon icon="demo-list-icon" slot="media"></f7-icon>
                </f7-list-input>

                <div class="block">
                    <div class="row">
                        <button class="button col button-fill">Cancel</button>
                        <button class="button col button-fill" onclick="try_Login">Login</button>
                    </div>
                </div>
            </f7-list>
        </f7-block>
    </f7-page>
</template>
