import { User, UserRole } from "@/user/models/user";
import { IconDefinition } from "@fortawesome/angular-fontawesome";
import { faUser, faUserAstronaut, faUserGraduate, faUserTag } from "@fortawesome/free-solid-svg-icons";

const DEFAULT_USER_ICON = faUser;

const ROLE_ICONS: Record<UserRole, IconDefinition> = {
    [UserRole.SUPERUSER]: faUserAstronaut,
    [UserRole.ANNOTATOR]: faUserTag,
    [UserRole.MASTER_ANNOTATOR]: faUserGraduate,
    [UserRole.VISITOR]: faUser,
};

export default function user2icon(user: User | null | undefined): IconDefinition {
    return user ? ROLE_ICONS[user.role] : DEFAULT_USER_ICON;
}
